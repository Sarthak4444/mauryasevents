import mongoose from "mongoose";
import GiftCardTransaction from "../../../../models/GiftCardTransaction";
import { NextResponse } from "next/server";

// Get all transactions (for super admin)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;
    const employeeId = searchParams.get("employeeId");
    const cardCode = searchParams.get("cardCode");
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Build query
    const query = {};
    if (employeeId) query.employeeId = employeeId;
    if (cardCode) query.cardCode = cardCode.toUpperCase();
    
    // Get total count
    const totalCount = await GiftCardTransaction.countDocuments(query);
    
    // Get transactions
    const transactions = await GiftCardTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    // Calculate totals
    const totals = await GiftCardTransaction.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: null, 
          totalDeducted: { 
            $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$amount', 0] } 
          },
          totalRefunded: { 
            $sum: { $cond: [{ $eq: ['$type', 'refund'] }, '$amount', 0] } 
          }
        } 
      }
    ]);
    
    return NextResponse.json({
      success: true,
      transactions,
      totalCount,
      totals: {
        deducted: totals[0]?.totalDeducted || 0,
        refunded: totals[0]?.totalRefunded || 0
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
