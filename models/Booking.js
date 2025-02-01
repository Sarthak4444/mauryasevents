



import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  people: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  note: { type: String },
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
