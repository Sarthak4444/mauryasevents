import mongoose from 'mongoose';

const GiftCardSchema = new mongoose.Schema({
  // Unique 8-character code for redemption
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    length: 8
  },
  
  // Original amount when purchased
  originalAmount: {
    type: Number,
    required: true,
    min: 10,
    max: 500
  },
  
  // Remaining balance
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Email of the card owner (recipient)
  ownerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  // Name of the card owner (recipient)
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Email of the person who bought the card
  buyerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  // Name of the person who bought the card
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Is this a bonus card?
  isBonus: {
    type: Boolean,
    default: false
  },
  
  // Reference to the parent card (if this is a bonus card)
  parentCardCode: {
    type: String,
    default: null
  },
  
  // Is the card for self or a friend?
  isGift: {
    type: Boolean,
    default: false
  },
  
  // Friend's email if it's a gift
  friendEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  
  // Status of the card
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Order reference for tracking
  orderId: {
    type: String,
    required: true
  },
  
  // Stripe payment intent ID
  stripePaymentId: {
    type: String,
    default: null
  },
  
  // Personal message (optional)
  personalMessage: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  
  // Expiry date (optional - can set expiry policy)
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Index for faster queries
GiftCardSchema.index({ ownerEmail: 1 });
GiftCardSchema.index({ buyerEmail: 1 });
GiftCardSchema.index({ code: 1 });
GiftCardSchema.index({ orderId: 1 });

const GiftCard = mongoose.connection.models.GiftCard || mongoose.model('GiftCard', GiftCardSchema);

export default GiftCard;

