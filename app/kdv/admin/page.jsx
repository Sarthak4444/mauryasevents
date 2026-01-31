"use client";
import { useEffect, useState } from "react";
import moment from "moment";

export default function KDVAdminPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const correctPasscode = "kdv2025";

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/kdv/new-event");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 60000); // Fetch every 60 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Sort bookings by creation date (newest first) and filter by search
    let filtered = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.email.toLowerCase().includes(search) ||
        booking.phone.includes(search) ||
        booking.ticketHolders.some(holder => 
          holder.firstName.toLowerCase().includes(search) ||
          holder.lastName.toLowerCase().includes(search) ||
          holder.ticketNumber.toLowerCase().includes(search)
        )
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, searchTerm]);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect passcode. Please try again.");
    }
  };

  // Calculate totals
  const totalTickets = bookings.reduce((sum, b) => sum + b.totalTickets, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return isAuthenticated ? (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Kamloops Dance Vibes - Ticket Bookings</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email, phone, name, or ticket number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-3 rounded-lg border-2 border-[#d88728] focus:outline-none"
        />
      </div>

      {loading && <p className="text-center text-lg">Loading bookings...</p>}
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-white text-left">
                <th className="border px-6 py-3">Email</th>
                <th className="border px-6 py-3">Phone</th>
                <th className="border px-6 py-3">Total Tickets</th>
                <th className="border px-6 py-3">Total Amount</th>
                <th className="border px-6 py-3">Ticket Holders</th>
                <th className="border px-6 py-3">Payment Status</th>
                <th className="border px-6 py-3">Booking Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr key={booking._id} className={`border ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="border px-6 py-3">{booking.email}</td>
                  <td className="border px-6 py-3">{booking.phone}</td>
                  <td className="border px-6 py-3">{booking.totalTickets}</td>
                  <td className="border px-6 py-3">${booking.totalAmount.toFixed(2)} CAD</td>
                  <td className="border px-6 py-3">
                    <div className="max-w-xs">
                      {booking.ticketHolders.map((holder, holderIndex) => (
                        <div key={holderIndex} className="mb-2 p-2 bg-gray-100 rounded text-sm">
                          <div><strong>{holder.firstName} {holder.lastName}</strong></div>
                          <div className="text-gray-600">Ticket: {holder.ticketNumber}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="border px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.paymentStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="border px-6 py-3">
                    {moment(booking.createdAt).format('MMM DD, YYYY HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              {searchTerm ? 'No bookings found matching your search.' : 'No bookings yet.'}
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handlePasscodeSubmit} className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">KDV Admin - Enter Passcode</h2>
        <input 
          type="password" 
          maxLength={10} 
          value={passcode} 
          onChange={(e) => setPasscode(e.target.value)} 
          className="border px-4 py-2 rounded-lg w-full text-center mb-4" 
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
