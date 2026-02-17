import mongoose from 'mongoose';

const GiftCardTransactionSchema = new mongoose.Schema({
  // Reference to the gift card
  cardCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  
  // Card owner info at time of transaction
  cardOwnerName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Transaction type
  type: {
    type: String,
    enum: ['deduction', 'refund', 'adjustment'],
    default: 'deduction'
  },
  
  // Amount of the transaction
  amount: {
    type: Number,
    required: true
  },
  
  // Balance before transaction
  previousBalance: {
    type: Number,
    required: true
  },
  
  // Balance after transaction
  newBalance: {
    type: Number,
    required: true
  },
  
  // Employee who performed the transaction
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  
  // Employee name (stored for historical purposes even if employee is archived)
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Optional note about the transaction
  note: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Indexes for faster queries
GiftCardTransactionSchema.index({ cardCode: 1 });
GiftCardTransactionSchema.index({ employeeId: 1 });
GiftCardTransactionSchema.index({ createdAt: -1 });

const GiftCardTransaction = mongoose.models.GiftCardTransaction || mongoose.model('GiftCardTransaction', GiftCardTransactionSchema);

export default GiftCardTransaction;
