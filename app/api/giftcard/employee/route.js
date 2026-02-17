import mongoose from "mongoose";
import GiftCard from "../../../../models/GiftCard";
import Employee from "../../../../models/Employee";
import GiftCardTransaction from "../../../../models/GiftCardTransaction";
import { NextResponse } from "next/server";

// GET: Check gift card balance OR authenticate employee
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const authPasscode = searchParams.get("auth");
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    // If auth parameter is provided, authenticate employee
    if (authPasscode) {
      const employee = await Employee.findOne({ 
        passcode: authPasscode,
        status: 'active'
      });
      
      if (!employee) {
        return NextResponse.json(
          { error: "Invalid passcode or employee is not active" },
          { status: 401 }
        );
      }
      
      return NextResponse.json({
        success: true,
        employee: {
          _id: employee._id,
          name: employee.name
        }
      }, { status: 200 });
    }
    
    // Otherwise, look up gift card
    if (!code) {
      return NextResponse.json(
        { error: "Card code is required" },
        { status: 400 }
      );
    }
    
    // Find the card by code only
    const card = await GiftCard.findOne({ 
      code: code.toUpperCase().trim()
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Gift card not found. Please check the code." },
        { status: 404 }
      );
    }
    
    // Return card details
    return NextResponse.json({
      success: true,
      card: {
        _id: card._id,
        code: card.code,
        originalAmount: card.originalAmount,
        remainingAmount: card.remainingAmount,
        ownerName: card.ownerName,
        ownerEmail: card.ownerEmail,
        status: card.status,
        isBonus: card.isBonus,
        createdAt: card.createdAt
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Employee GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Deduct amount from gift card (for employee use)
export async function POST(req) {
  try {
    const { code, deductAmount, note, employeeId } = await req.json();
    
    // Validate required fields
    if (!code || deductAmount === undefined || !employeeId) {
      return NextResponse.json(
        { error: "Card code, deduct amount, and employee ID are required" },
        { status: 400 }
      );
    }
    
    const parsedAmount = parseFloat(deductAmount);
    
    if (parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Deduct amount must be greater than 0" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Verify employee exists and is active
    const employee = await Employee.findById(employeeId);
    if (!employee || employee.status !== 'active') {
      return NextResponse.json(
        { error: "Invalid or inactive employee" },
        { status: 401 }
      );
    }
    
    // Find the card
    const card = await GiftCard.findOne({ 
      code: code.toUpperCase().trim()
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }
    
    // Check if card is active
    if (card.status !== 'active') {
      return NextResponse.json(
        { error: `Card is ${card.status}. Cannot process transaction.` },
        { status: 400 }
      );
    }
    
    // Check if sufficient balance
    if (parsedAmount > card.remainingAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Card has $${card.remainingAmount.toFixed(2)} remaining.` },
        { status: 400 }
      );
    }
    
    // Store previous balance for response
    const previousBalance = card.remainingAmount;
    
    // Deduct amount
    card.remainingAmount = parseFloat((card.remainingAmount - parsedAmount).toFixed(2));
    
    // Update status if fully redeemed
    if (card.remainingAmount === 0) {
      card.status = 'redeemed';
    }
    
    await card.save();
    
    // Create transaction record
    const transaction = new GiftCardTransaction({
      cardCode: card.code,
      cardOwnerName: card.ownerName,
      type: 'deduction',
      amount: parsedAmount,
      previousBalance: previousBalance,
      newBalance: card.remainingAmount,
      employeeId: employee._id,
      employeeName: employee.name,
      note: note || ''
    });
    
    await transaction.save();
    
    return NextResponse.json({
      success: true,
      message: "Transaction completed successfully",
      transaction: {
        _id: transaction._id,
        code: card.code,
        ownerName: card.ownerName,
        deductedAmount: parsedAmount,
        previousBalance: previousBalance,
        newBalance: card.remainingAmount,
        status: card.status,
        note: note || '',
        employeeName: employee.name
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Employee POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
