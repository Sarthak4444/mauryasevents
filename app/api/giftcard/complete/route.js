import nodemailer from "nodemailer";
import mongoose from "mongoose";
import GiftCard from "../../../../models/GiftCard";
import { NextResponse } from "next/server";

// Generate unique 8-character alphanumeric code
const generateUniqueCode = async () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0,O,1,I
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

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });
};

// Generate gift card HTML for email
const generateCardHTML = (card, isBonus = false) => {
  const cardType = isBonus ? 'BONUS' : 'GIFT';
  const cardTitle = isBonus ? 'BONUS FOR YOU!' : 'GIFT FOR YOU!';
  const cardColor = '#d88728';
  
  return `
    <div style="border: 2px solid ${cardColor}; border-radius: 10px; padding: 20px; margin: 15px 0; background: linear-gradient(135deg, #fff 0%, #fef9f3 100%);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 style="color: ${cardColor}; font-style: italic; font-weight: bold; font-size: 28px; margin: 0;">${cardTitle}</h2>
        </div>
        <div style="border: 2px solid ${cardColor}; padding: 10px 20px; text-align: center;">
          <div style="font-size: 20px; font-weight: bold;">$${card.originalAmount}</div>
          <div style="font-size: 12px; color: ${cardColor};">${cardType} CARD</div>
        </div>
      </div>
      <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
        <p style="margin: 5px 0; font-size: 14px;"><strong>Card Code:</strong> <span style="font-family: monospace; font-size: 18px; letter-spacing: 2px; color: ${cardColor};">${card.code}</span></p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>For:</strong> ${card.ownerName}</p>
        ${card.personalMessage ? `<p style="margin: 10px 0; font-style: italic; color: #666;">"${card.personalMessage}"</p>` : ''}
      </div>
      <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
        <p style="margin: 0; font-size: 12px; color: #666;">165 Victoria Street, Kamloops | 250-377-4969</p>
        <p style="margin: 5px 0; font-size: 11px; color: #888;">Redeemable for Regular food menu only. No cash value.</p>
      </div>
    </div>
  `;
};

// Send email to buyer
const sendBuyerEmail = async (transporter, orderData, allCards) => {
  const purchasedCards = allCards.filter(c => !c.isBonus);
  const bonusCards = allCards.filter(c => c.isBonus);
  
  // Separate cards for self vs gifts
  const selfCards = purchasedCards.filter(c => c.ownerEmail === orderData.buyerEmail);
  const giftedCards = purchasedCards.filter(c => c.ownerEmail !== orderData.buyerEmail);
  
  const selfCardsHTML = selfCards.map(card => generateCardHTML(card, false)).join('');
  const bonusCardsHTML = bonusCards.map(card => generateCardHTML(card, true)).join('');
  
  // Generate summary for gifted cards
  const giftedSummaryHTML = giftedCards.length > 0 ? `
    <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 15px 0;">
      <p style="margin: 0 0 10px 0; color: #2e7d32;"><strong>✉️ Gifts Sent!</strong></p>
      ${giftedCards.map(card => `
        <p style="margin: 5px 0; font-size: 14px; color: #333;">
          • <strong>$${card.originalAmount}</strong> card sent to <strong>${card.ownerName}</strong> (${card.ownerEmail})
        </p>
      `).join('')}
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Recipients will receive an email with their card details.</p>
    </div>
  ` : '';
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: orderData.buyerEmail,
    subject: "🎁 Your Maurya's Gift Card Purchase Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 650px; line-height: 1.8;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; margin-bottom: 5px;">Maurya's</h1>
          <p style="color: #d88728; margin: 0;">Craft Bar & Kitchen</p>
        </div>
        
        <p style="font-size: 18px;">Dear <strong>${orderData.buyerName}</strong>,</p>
        
        <p>Thank you for purchasing Maurya's Gift Card${purchasedCards.length > 1 ? 's' : ''}!</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #d88728; margin-top: 0;">Order Summary</h3>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Total Cards:</strong> ${purchasedCards.length}</p>
          <p><strong>Total Amount Paid:</strong> $${orderData.totalAmount.toFixed(2)} CAD</p>
          ${bonusCards.length > 0 ? `<p style="color: #d88728;"><strong>🎉 Bonus Cards Earned:</strong> ${bonusCards.length} (Worth $${bonusCards.reduce((sum, c) => sum + c.originalAmount, 0)} CAD)</p>` : ''}
        </div>
        
        ${selfCards.length > 0 ? `
          <h3 style="color: #d88728;">Your Gift Cards</h3>
          ${selfCardsHTML}
        ` : ''}
        
        ${giftedSummaryHTML}
        
        ${bonusCards.length > 0 ? `
          <h3 style="color: #d88728;">🎁 Your Bonus Cards</h3>
          <p style="color: #666; font-size: 14px;">As a thank you for your purchase, here are your bonus cards!</p>
          ${bonusCardsHTML}
        ` : ''}
        
        <div style="margin-top: 30px; padding: 20px; background: #fff3e0; border-radius: 10px;">
          <h4 style="margin-top: 0; color: #d88728;">How to Redeem</h4>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Visit Maurya's Craft Bar & Kitchen</li>
            <li>Present the card code and email when paying</li>
            <li>The amount will be deducted from your gift card when the bill is applied</li>
          </ol>
          <p style="margin-bottom: 0; font-size: 12px; color: #666;">Cards can be used for multiple visits until the balance is zero.</p>
        </div>
        
        <div style="border-top: 2px solid #d88728; padding-top: 15px; margin-top: 30px;">
          <p><strong>Maurya's Craft Bar & Kitchen</strong></p>
          <p>📍 165 Victoria St, Kamloops, BC, Canada. V2C 1Z4</p>
          <p>📞 +1 250 377 4969</p>
          <p>📧 comments@mauryascuisine.com</p>
          <p>🌐 <a href="https://www.mauryascuisine.com" style="color: #d88728;">www.mauryascuisine.com</a></p>
        </div>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

// Send email to gift recipient
const sendRecipientEmail = async (transporter, card, buyerName) => {
  const cardHTML = generateCardHTML(card, false);
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: card.ownerEmail,
    subject: `🎁 ${buyerName} sent you a Maurya's Gift Card!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 650px; line-height: 1.8;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; margin-bottom: 5px;">Maurya's</h1>
          <p style="color: #d88728; margin: 0;">Craft Bar & Kitchen</p>
        </div>
        
        <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #fff3e0 0%, #fff 100%); border-radius: 15px; margin-bottom: 20px;">
          <h2 style="color: #d88728; margin: 0;">🎉 You've Received a Gift!</h2>
          <p style="font-size: 18px; color: #333;">${buyerName} sent you a gift card</p>
        </div>
        
        <p style="font-size: 16px;">Dear <strong>${card.ownerName}</strong>,</p>
        
        <p>Great news! ${buyerName} has sent you a Maurya's Gift Card worth <strong>$${card.originalAmount} CAD</strong>!</p>
        
        ${cardHTML}
        
        <div style="margin-top: 30px; padding: 20px; background: #fff3e0; border-radius: 10px;">
          <h4 style="margin-top: 0; color: #d88728;">How to Redeem</h4>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Visit Maurya's Craft Bar & Kitchen</li>
            <li>Present the card code when paying</li>
            <li>The amount will be deducted from your bill</li>
          </ol>
          <p style="margin-bottom: 0; font-size: 12px; color: #666;">Cards can be used for multiple visits until the balance is exhausted.</p>
        </div>
        
        <div style="border-top: 2px solid #d88728; padding-top: 15px; margin-top: 30px;">
          <p><strong>Maurya's Craft Bar & Kitchen</strong></p>
          <p>📍 165 Victoria St, Kamloops, BC, Canada. V2C 1Z4</p>
          <p>📞 +1 250 377 4969</p>
          <p>📧 comments@mauryascuisine.com</p>
          <p>🌐 <a href="https://www.mauryascuisine.com" style="color: #d88728;">www.mauryascuisine.com</a></p>
        </div>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

export async function POST(req) {
  try {
    const orderData = await req.json();
    const { buyerName, buyerEmail, cards, isGift, bonusAmount, totalAmount, orderId } = orderData;
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Validate required fields
    if (!buyerName || !buyerEmail || !cards || cards.length === 0 || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if order already processed
    const existingOrder = await GiftCard.findOne({ orderId });
    if (existingOrder) {
      return NextResponse.json(
        { error: "Order already processed" },
        { status: 400 }
      );
    }
    
    const allCreatedCards = [];
    const transporter = createTransporter();
    
    // Create gift cards
    for (const cardData of cards) {
      const code = await generateUniqueCode();
      const amount = parseFloat(cardData.amount);
      
      const isGiftCard = isGift || cardData.recipientEmail !== buyerEmail;
      
      const newCard = new GiftCard({
        code,
        originalAmount: amount,
        remainingAmount: amount,
        ownerEmail: cardData.recipientEmail,
        ownerName: cardData.recipientName,
        buyerEmail,
        buyerName,
        isBonus: false,
        parentCardCode: null,
        isGift: isGiftCard,
        friendEmail: isGiftCard ? cardData.recipientEmail : null,
        status: 'active',
        orderId,
        personalMessage: cardData.personalMessage || ''
      });
      
      await newCard.save();
      allCreatedCards.push(newCard);
      
      // Create bonus card if applicable
      let bonusCardAmount = 0;
      if (amount >= 100) {
        bonusCardAmount = 20;
      } else if (amount >= 50) {
        bonusCardAmount = 10;
      }
      
      if (bonusCardAmount > 0) {
        const bonusCode = await generateUniqueCode();
        const bonusCard = new GiftCard({
          code: bonusCode,
          originalAmount: bonusCardAmount,
          remainingAmount: bonusCardAmount,
          ownerEmail: buyerEmail, // Bonus always goes to buyer
          ownerName: buyerName,
          buyerEmail,
          buyerName,
          isBonus: true,
          parentCardCode: code,
          isGift: false,
          status: 'active',
          orderId,
          personalMessage: ''
        });
        
        await bonusCard.save();
        allCreatedCards.push(bonusCard);
      }
      
      // Send email to recipient if it's a gift
      if (isGiftCard && cardData.recipientEmail !== buyerEmail) {
        try {
          await sendRecipientEmail(transporter, newCard, buyerName);
        } catch (emailError) {
          console.error("Failed to send recipient email:", emailError);
        }
      }
    }
    
    // Send confirmation email to buyer
    try {
      await sendBuyerEmail(transporter, orderData, allCreatedCards);
    } catch (emailError) {
      console.error("Failed to send buyer email:", emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: "Gift cards created successfully",
      cards: allCreatedCards.map(c => ({
        code: c.code,
        amount: c.originalAmount,
        ownerName: c.ownerName,
        ownerEmail: c.ownerEmail,
        isBonus: c.isBonus
      }))
    }, { status: 200 });
    
  } catch (error) {
    console.error("Complete order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

