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
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center text-white">🎶 Kamloops Dance Vibes</h1>
        <h2 className="text-xl text-purple-300 mb-8 text-center">Admin Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-medium">Total Bookings</h3>
            <p className="text-3xl font-bold text-white">{bookings.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-medium">Total Tickets Sold</h3>
            <p className="text-3xl font-bold text-white">{totalTickets}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)} CAD</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by email, phone, name, or ticket number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-3 rounded-lg bg-white/10 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
          />
        </div>

        {loading && <p className="text-center text-lg text-white">Loading bookings...</p>}
        {error && <p className="text-center text-red-400 text-lg">{error}</p>}
        
        {!loading && !error && (
          <div className="overflow-x-auto shadow-lg rounded-xl">
            <table className="min-w-full bg-white/10 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-purple-900/50 text-white text-left">
                  <th className="border-b border-purple-500/30 px-6 py-4">Email</th>
                  <th className="border-b border-purple-500/30 px-6 py-4">Phone</th>
                  <th className="border-b border-purple-500/30 px-6 py-4">Total Tickets</th>
                  <th className="border-b border-purple-500/30 px-6 py-4">Total Amount</th>
                  <th className="border-b border-purple-500/30 px-6 py-4">Ticket Holders</th>
                  <th className="border-b border-purple-500/30 px-6 py-4">Payment Status</th>
                  <th className="border-b border-purple-500/30 px-6 py-4">Booking Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr key={booking._id} className={`border-b border-purple-500/20 ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'} text-white`}>
                    <td className="px-6 py-4">{booking.email}</td>
                    <td className="px-6 py-4">{booking.phone}</td>
                    <td className="px-6 py-4">{booking.totalTickets}</td>
                    <td className="px-6 py-4">${booking.totalAmount.toFixed(2)} CAD</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {booking.ticketHolders.map((holder, holderIndex) => (
                          <div key={holderIndex} className="mb-2 p-2 bg-purple-900/30 rounded text-sm">
                            <div><strong>{holder.firstName} {holder.lastName}</strong></div>
                            <div className="text-purple-300">Ticket: {holder.ticketNumber}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.paymentStatus === 'completed' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-purple-200">
                      {moment(booking.createdAt).format('MMM DD, YYYY HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-10 text-purple-300">
                {searchTerm ? 'No bookings found matching your search.' : 'No bookings yet.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-purple-950 via-black to-black">
      <form onSubmit={handlePasscodeSubmit} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30 text-center max-w-sm w-full mx-4">
        <h1 className="text-2xl font-bold mb-2 text-white">🎶 KDV Admin</h1>
        <h2 className="text-purple-300 mb-6">Enter Passcode</h2>
        <input 
          type="password" 
          maxLength={10} 
          value={passcode} 
          onChange={(e) => setPasscode(e.target.value)} 
          className="border-2 border-purple-500 bg-white/90 px-4 py-3 rounded-lg w-full text-center mb-4 focus:outline-none focus:border-pink-500" 
          placeholder="••••••••"
        />
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
        >
          Access Dashboard
        </button>
      </form>
    </div>
  );
}

