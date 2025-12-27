import mongoose from 'mongoose';

const TicketHolderSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  ticketType: { 
    type: String, 
    required: true, 
    enum: ['general', 'student', 'kids'],
    default: 'general'
  },
  ticketNumber: { type: String, required: true, unique: true },
});

const BookingSchema = new mongoose.Schema({
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
  ticketHolders: [TicketHolderSchema],
  totalTickets: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'completed' },
}, { timestamps: true });

const Booking = mongoose.connection.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
