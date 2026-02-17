import mongoose from "mongoose";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import GiftCard from "../../../../models/GiftCard";
import { NextResponse } from "next/server";

// Generate unique 8-character alphanumeric code
const generateUniqueCode = async () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existingCard = await GiftCard.findOne({ code });
    if (!existingCard) {
      isUnique = true;
    }
  }
  return code;
};

// Generate QR code as base64 data URL
const generateQRCode = async (code) => {
  try {
    return await QRCode.toDataURL(code, {
      width: 120,
      margin: 1,
      color: { dark: '#d88728', light: '#ffffff' }
    });
  } catch (error) {
    console.error("QR code generation error:", error);
    return null;
  }
};

// Generate unique order ID for admin-created cards
const generateOrderId = () => {
  return 'ADMIN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
};

// Get all gift cards (admin only)
export async function GET(req) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get all gift cards, sorted by creation date (newest first)
    const cards = await GiftCard.find().sort({ createdAt: -1 });
    
    // Group cards by orderId and include bonus cards with their parent
    const groupedCards = {};
    const bonusCards = [];
    
    cards.forEach(card => {
      if (card.isBonus && card.parentCardCode) {
        bonusCards.push(card);
      } else {
        if (!groupedCards[card.orderId]) {
          groupedCards[card.orderId] = {
            orderId: card.orderId,
            buyerName: card.buyerName,
            buyerEmail: card.buyerEmail,
            createdAt: card.createdAt,
            cards: []
          };
        }
        groupedCards[card.orderId].cards.push({
          _id: card._id,
          code: card.code,
          originalAmount: card.originalAmount,
          remainingAmount: card.remainingAmount,
          ownerName: card.ownerName,
          ownerEmail: card.ownerEmail,
          isGift: card.isGift,
          status: card.status,
          personalMessage: card.personalMessage,
          bonusCard: null
        });
      }
    });
    
    // Attach bonus cards to their parent cards
    bonusCards.forEach(bonus => {
      for (const orderId in groupedCards) {
        const cardIndex = groupedCards[orderId].cards.findIndex(
          c => c.code === bonus.parentCardCode
        );
        if (cardIndex !== -1) {
          groupedCards[orderId].cards[cardIndex].bonusCard = {
            _id: bonus._id,
            code: bonus.code,
            originalAmount: bonus.originalAmount,
            remainingAmount: bonus.remainingAmount,
            ownerName: bonus.ownerName,
            ownerEmail: bonus.ownerEmail,
            status: bonus.status
          };
          break;
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      orders: Object.values(groupedCards),
      totalCards: cards.length
    }, { status: 200 });
    
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a gift card amount (admin only)
export async function PUT(req) {
  try {
    const { cardId, code, newAmount } = await req.json();
    
    // Validate required fields
    if (!cardId || !code || newAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (newAmount < 0) {
      return NextResponse.json(
        { error: "Amount cannot be negative" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the card
    const card = await GiftCard.findById(cardId);
    
    if (!card) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }
    
    // Verify code matches
    if (card.code !== code.toUpperCase().trim()) {
      return NextResponse.json(
        { error: "Invalid card code" },
        { status: 400 }
      );
    }
    
    // Update the card
    card.remainingAmount = parseFloat(newAmount);
    
    // Update status based on amount
    if (newAmount === 0) {
      card.status = 'redeemed';
    } else if (card.status === 'redeemed') {
      card.status = 'active';
    }
    
    await card.save();
    
    return NextResponse.json({
      success: true,
      message: "Gift card updated successfully",
      card: {
        _id: card._id,
        code: card.code,
        originalAmount: card.originalAmount,
        remainingAmount: card.remainingAmount,
        status: card.status
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Admin PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new gift card (admin only - no payment required)
export async function POST(req) {
  try {
    const { ownerName, ownerEmail, amount, personalMessage, sendEmail } = await req.json();
    
    // Validate required fields
    if (!ownerName || !ownerEmail || !amount) {
      return NextResponse.json(
        { error: "Owner name, email, and amount are required" },
        { status: 400 }
      );
    }
    
    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (parsedAmount < 1 || parsedAmount > 1000) {
      return NextResponse.json(
        { error: "Amount must be between $1 and $1000" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Generate unique code and order ID
    const code = await generateUniqueCode();
    const orderId = generateOrderId();
    
    // Create the gift card
    const newCard = new GiftCard({
      code,
      originalAmount: parsedAmount,
      remainingAmount: parsedAmount,
      ownerEmail: ownerEmail.toLowerCase().trim(),
      ownerName: ownerName.trim(),
      buyerEmail: 'admin@mauryascuisine.com',
      buyerName: 'Maurya\'s Admin',
      isBonus: false,
      parentCardCode: null,
      isGift: false,
      status: 'active',
      orderId,
      personalMessage: personalMessage || 'Complimentary gift card from Maurya\'s'
    });
    
    await newCard.save();
    
    // Send email if requested
    if (sendEmail) {
      try {
        const qrCode = await generateQRCode(code);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS,
          },
        });
        
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: ownerEmail,
          subject: "🎁 You've Received a Maurya's Gift Card!",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 650px; line-height: 1.8;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; margin-bottom: 5px;">Maurya's</h1>
                <p style="color: #d88728; margin: 0;">Craft Bar & Kitchen</p>
              </div>
              
              <p style="font-size: 18px;">Dear <strong>${ownerName}</strong>,</p>
              
              <p>Great news! You've received a complimentary Maurya's Gift Card!</p>
              
              <div style="border: 2px solid #d88728; border-radius: 10px; padding: 20px; margin: 20px 0; background: linear-gradient(135deg, #fff 0%, #fef9f3 100%);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h2 style="color: #d88728; font-style: italic; font-weight: bold; font-size: 28px; margin: 0;">GIFT FOR YOU!</h2>
                  </div>
                  <div style="border: 2px solid #d88728; padding: 10px 20px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold;">$${parsedAmount}</div>
                    <div style="font-size: 12px; color: #d88728;">GIFT CARD</div>
                  </div>
                </div>
                <div style="margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align: top;">
                        <p style="margin: 5px 0; font-size: 14px;"><strong>Card Code:</strong></p>
                        <p style="margin: 5px 0; font-family: monospace; font-size: 22px; letter-spacing: 3px; color: #d88728; font-weight: bold;">${code}</p>
                        <p style="margin: 10px 0 5px 0; font-size: 14px;"><strong>For:</strong> ${ownerName}</p>
                        ${personalMessage ? `<p style="margin: 10px 0; font-style: italic; color: #666;">"${personalMessage}"</p>` : ''}
                      </td>
                      ${qrCode ? `
                      <td style="vertical-align: top; text-align: right; width: 130px;">
                        <div style="text-align: center;">
                          <img src="${qrCode}" alt="QR Code" style="width: 120px; height: 120px; border: 2px solid #d88728; border-radius: 8px;" />
                          <p style="margin: 5px 0 0 0; font-size: 10px; color: #888;">Scan to redeem</p>
                        </div>
                      </td>
                      ` : ''}
                    </tr>
                  </table>
                </div>
                <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                  <p style="margin: 0; font-size: 12px; color: #666;">165 Victoria Street, Kamloops | 250-377-4969</p>
                  <p style="margin: 5px 0; font-size: 11px; color: #888;">Redeemable for Regular food menu only. No cash value.</p>
                </div>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #fff3e0; border-radius: 10px;">
                <h4 style="margin-top: 0; color: #d88728;">How to Redeem</h4>
                <ol style="margin: 0; padding-left: 20px;">
                  <li>Visit Maurya's Craft Bar & Kitchen</li>
                  <li>Present the card code or scan the QR code when paying</li>
                  <li>The amount will be deducted from your bill</li>
                </ol>
                <p style="margin-bottom: 0; font-size: 12px; color: #666;">Cards can be used for multiple visits until the balance is exhausted.</p>
              </div>
              
              <div style="border-top: 2px solid #d88728; padding-top: 15px; margin-top: 30px;">
                <p><strong>Maurya's Craft Bar & Kitchen</strong></p>
                <p>📍 165 Victoria St, Kamloops, BC, Canada. V2C 1Z4</p>
                <p>📞 +1 250 377 4969</p>
                <p>🌐 <a href="https://www.mauryascuisine.com" style="color: #d88728;">www.mauryascuisine.com</a></p>
              </div>
            </div>
          `,
        };
        
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the request if email fails
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Gift card created successfully",
      card: {
        _id: newCard._id,
        code: newCard.code,
        originalAmount: newCard.originalAmount,
        remainingAmount: newCard.remainingAmount,
        ownerName: newCard.ownerName,
        ownerEmail: newCard.ownerEmail,
        status: newCard.status,
        orderId: newCard.orderId
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a gift card (admin only)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("cardId");
    const code = searchParams.get("code");
    
    // Validate required fields
    if (!cardId || !code) {
      return NextResponse.json(
        { error: "Card ID and code are required" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the card
    const card = await GiftCard.findById(cardId);
    
    if (!card) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }
    
    // Verify code matches
    if (card.code !== code.toUpperCase().trim()) {
      return NextResponse.json(
        { error: "Invalid card code" },
        { status: 400 }
      );
    }
    
    // Delete the card
    await GiftCard.findByIdAndDelete(cardId);
    
    return NextResponse.json({
      success: true,
      message: "Gift card deleted successfully"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Admin DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

