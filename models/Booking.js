import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
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
  people: { type: Number, required: true, min: 1 },
  date: { type: String, required: true, trim: true },
  time: { type: String, required: true, trim: true },
  note: { type: String, trim: true },
}, { timestamps: true });

const Booking = mongoose.connection.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
