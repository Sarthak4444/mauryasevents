import mongoose from 'mongoose';

const ValentinesBookingSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true, 
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true, 
  },
  numberOfGuests: { 
    type: Number, 
    required: true,
    min: 1
  },
  date: { 
    type: String, 
    required: true,
    enum: ['13th', '14th', '15th']
  },
  timeSlot: { 
    type: String, 
    required: true 
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free']
  }],
  notesAndAllergies: { 
    type: String, 
    trim: true,
    default: ''
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  paymentStatus: { 
    type: String, 
    default: 'completed' 
  },
}, { timestamps: true });

const ValentinesBooking = mongoose.connection.models.ValentinesBooking || mongoose.model('ValentinesBooking', ValentinesBookingSchema);

export default ValentinesBooking;

