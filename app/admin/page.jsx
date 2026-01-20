"use client";
import { useEffect, useState } from "react";
import moment from "moment";

export default function ValentinesAdminPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const correctPasscode = "val2025";

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/valentines/new-booking");
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
      const interval = setInterval(fetchBookings, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = [...bookings];
    
    // Filter by date
    if (dateFilter !== "all") {
      filtered = filtered.filter(booking => booking.date === dateFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.name.toLowerCase().includes(search) ||
        booking.email.toLowerCase().includes(search) ||
        booking.phone.includes(search) ||
        booking.bookingNumber.toLowerCase().includes(search)
      );
    }
    
    // Sort by date and time
    filtered.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.timeSlot.localeCompare(b.timeSlot);
    });
    
    setFilteredBookings(filtered);
  }, [bookings, searchTerm, dateFilter]);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect passcode. Please try again.");
    }
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const totalGuests = bookings.reduce((sum, b) => sum + b.numberOfGuests, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  
  // Stats by date
  const statsByDate = {
    "13th": { bookings: 0, guests: 0 },
    "14th": { bookings: 0, guests: 0 },
    "15th": { bookings: 0, guests: 0 },
  };
  bookings.forEach(b => {
    if (statsByDate[b.date]) {
      statsByDate[b.date].bookings++;
      statsByDate[b.date].guests += b.numberOfGuests;
    }
  });

  return isAuthenticated ? (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">💝 Valentine's Day Reservations</h1>
        <h2 className="text-gray-600 mb-8 text-center">Admin Dashboard</h2>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Reservations</h3>
            <p className="text-3xl font-bold text-red-600">{totalBookings}</p>
          </div>
          <div className="bg-white border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Guests</h3>
            <p className="text-3xl font-bold text-red-600">{totalGuests}</p>
          </div>
          <div className="bg-white border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-red-600">${totalRevenue} CAD</p>
          </div>
        </div>

        {/* Stats by Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(statsByDate).map(([date, stats]) => (
            <div key={date} className="bg-white border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">February {date}</h3>
              <p className="text-sm text-gray-600">{stats.bookings} reservations • {stats.guests} guests</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, email, phone, or booking #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="13th">Feb 13th</option>
            <option value="14th">Feb 14th</option>
            <option value="15th">Feb 15th</option>
          </select>
        </div>

        {loading && <p className="text-center text-lg">Loading reservations...</p>}
        {error && <p className="text-center text-red-500 text-lg">{error}</p>}
        
        {!loading && !error && (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-800 text-white text-left">
                  <th className="border px-4 py-3">Booking #</th>
                  <th className="border px-4 py-3">Name</th>
                  <th className="border px-4 py-3">Contact</th>
                  <th className="border px-4 py-3">Date</th>
                  <th className="border px-4 py-3">Time</th>
                  <th className="border px-4 py-3">Guests</th>
                  <th className="border px-4 py-3">Amount</th>
                  <th className="border px-4 py-3">Dietary</th>
                  <th className="border px-4 py-3">Notes</th>
                  <th className="border px-4 py-3">Status</th>
                  <th className="border px-4 py-3">Booked On</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr key={booking._id} className={`border ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="border px-4 py-3 font-mono text-sm">{booking.bookingNumber}</td>
                    <td className="border px-4 py-3 font-medium">{booking.name}</td>
                    <td className="border px-4 py-3">
                      <div className="text-sm">
                        <div>{booking.email}</div>
                        <div className="text-gray-500">{booking.phone}</div>
                      </div>
                    </td>
                    <td className="border px-4 py-3">Feb {booking.date}</td>
                    <td className="border px-4 py-3">{booking.timeSlot}</td>
                    <td className="border px-4 py-3 text-center">{booking.numberOfGuests}</td>
                    <td className="border px-4 py-3">${booking.totalAmount}</td>
                    <td className="border px-4 py-3">
                      {booking.dietaryRestrictions && booking.dietaryRestrictions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {booking.dietaryRestrictions.map((d, i) => (
                            <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="border px-4 py-3">
                      {booking.notesAndAllergies ? (
                        <span className="text-sm">{booking.notesAndAllergies}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="border px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        booking.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="border px-4 py-3 text-sm text-gray-600">
                      {moment(booking.createdAt).format('MMM DD, HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                {searchTerm || dateFilter !== "all" ? 'No reservations found matching your filters.' : 'No reservations yet.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handlePasscodeSubmit} className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">💝 Valentine's Admin</h2>
        <p className="text-gray-600 mb-4">Enter Passcode</p>
        <input 
          type="password" 
          maxLength={10} 
          value={passcode} 
          onChange={(e) => setPasscode(e.target.value)} 
          className="border px-4 py-2 rounded-lg w-full text-center mb-4" 
        />
        <button 
          type="submit" 
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 w-full"
        >
          Access Dashboard
        </button>
      </form>
    </div>
  );
}
