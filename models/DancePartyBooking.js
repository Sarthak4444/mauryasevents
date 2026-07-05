import mongoose from 'mongoose';

const DancePartyTicketHolderSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  ticketNumber: { type: String, required: true, unique: true },
});

const DancePartyBookingSchema = new mongoose.Schema({
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
  ticketHolders: [DancePartyTicketHolderSchema],
  totalTickets: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'completed' },
}, { timestamps: true });

const DancePartyBooking = mongoose.connection.models.DancePartyBooking || mongoose.model('DancePartyBooking', DancePartyBookingSchema);

export default DancePartyBooking;
