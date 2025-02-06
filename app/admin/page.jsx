"use client";
import { useEffect, useState } from "react";
import moment from "moment";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedNotes, setExpandedNotes] = useState({});

  const correctPasscode = "140225";

    const toggleNote = (id) => {
      setExpandedNotes((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/new-event");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
      const interval = setInterval(fetchEvents, 60000); // Fetch every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const today = moment().startOf("day");
    let filtered = [...events];

    if (filter === "13th Feb") {
      filtered = filtered.filter((event) => moment(event.date).isSame("2025-02-13", "day"));
    } else if (filter === "14th Feb") {
      filtered = filtered.filter((event) => moment(event.date).isSame("2025-02-14", "day"));
    } else if (filter === "15th Feb") {
      filtered = filtered.filter((event) => moment(event.date).isSame("2025-02-15", "day"));
    }

    filtered.sort((a, b) => moment(a.time, "HH:mm").diff(moment(b.time, "HH:mm"))); // Sort by time
    setFilteredEvents(filtered);
  }, [filter, events]);

  const handlePasscodeSubmit = () => {
    if (passcode === correctPasscode) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect passcode. Please try again.");
    }
  };

  return isAuthenticated ? (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Event List</h1>
      <div className="mb-4 text-center">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border px-4 py-2 rounded-lg">
          <option value="all">All Events</option>
          <option value="13th Feb">13th Feb</option>
          <option value="14th Feb">14th Feb</option>
          <option value="15th Feb">15th Feb</option>
        </select>
      </div>
      {loading && <p className="text-center text-lg">Loading events...</p>}
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-white text-left">
                <th className="border px-6 py-3">Name</th>
                <th className="border px-6 py-3">Email</th>
                <th className="border px-6 py-3">Phone</th>
                <th className="border px-6 py-3">People</th>
                <th className="border px-6 py-3">Date</th>
                <th className="border px-6 py-3">Time</th>
                <th className="border px-6 py-3">Note</th>
                <th className="border px-6 py-3">Gift Cards</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event, index) => (
                <tr key={event._id} className={`border ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="border px-6 py-3">{event.firstName} {event.lastName}</td>
                  <td className="border px-6 py-3">{event.email}</td>
                  <td className="border px-6 py-3">{event.phone}</td>
                  <td className="border px-6 py-3">{event.people}</td>
                  <td className="border px-6 py-3">{event.date}</td>
                  <td className="border px-6 py-3">{event.time}</td>
                  <td className="border px-6 py-3 cursor-pointer" onClick={() => toggleNote(event._id)}>
          {expandedNotes[event._id] || event.note.length <= 20 
            ? event.note 
            : `${event.note.substring(0, 20)}...`}
        </td>
                  <td className="border px-6 py-3">$15 x {event.people} = ${15 * event.people}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handlePasscodeSubmit} className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Enter Passcode</h2>
        <input type="password" maxLength={6} value={passcode} onChange={(e) => setPasscode(e.target.value)} className="border px-4 py-2 rounded-lg w-full text-center mb-4" />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Submit</button>
      </form>
    </div>
  );
}
