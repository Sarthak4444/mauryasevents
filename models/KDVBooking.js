import mongoose from 'mongoose';

const KDVTicketHolderSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  ticketNumber: { type: String, required: true, unique: true },
});

const KDVBookingSchema = new mongoose.Schema({
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
  ticketHolders: [KDVTicketHolderSchema],
  totalTickets: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'completed' },
}, { timestamps: true });

const KDVBooking = mongoose.connection.models.KDVBooking || mongoose.model('KDVBooking', KDVBookingSchema);

export default KDVBooking;

