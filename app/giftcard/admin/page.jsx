"use client";
import { useEffect, useState } from "react";
import moment from "moment";

export default function GiftCardAdminPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Edit modal state
  const [selectedCard, setSelectedCard] = useState(null);
  const [editCode, setEditCode] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  
  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [createSendEmail, setCreateSendEmail] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  
  // Delete modal state
  const [deleteCard, setDeleteCard] = useState(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  
  // Stats
  const [stats, setStats] = useState({
    totalCards: 0,
    totalValue: 0,
    totalRemaining: 0,
    totalRedeemed: 0
  });

  const correctPasscode = "987654"; // Super Admin passcode

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/giftcard/admin");
      if (!response.ok) {
        throw new Error("Failed to fetch gift cards");
      }
      const data = await response.json();
      setOrders(data.orders || []);
      
      // Calculate stats
      let totalValue = 0;
      let totalRemaining = 0;
      let totalCards = 0;
      
      data.orders?.forEach(order => {
        order.cards?.forEach(card => {
          totalCards++;
          totalValue += card.originalAmount;
          totalRemaining += card.remainingAmount;
          if (card.bonusCard) {
            totalCards++;
            totalValue += card.bonusCard.originalAmount;
            totalRemaining += card.bonusCard.remainingAmount;
          }
        });
      });
      
      setStats({
        totalCards,
        totalValue,
        totalRemaining,
        totalRedeemed: totalValue - totalRemaining
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = [...orders];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.buyerName?.toLowerCase().includes(term) ||
        order.buyerEmail?.toLowerCase().includes(term) ||
        order.orderId?.toLowerCase().includes(term) ||
        order.cards?.some(card => 
          card.code?.toLowerCase().includes(term) ||
          card.ownerName?.toLowerCase().includes(term) ||
          card.ownerEmail?.toLowerCase().includes(term) ||
          card.bonusCard?.code?.toLowerCase().includes(term)
        )
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order =>
        order.cards?.some(card => 
          card.status === statusFilter || 
          card.bonusCard?.status === statusFilter
        )
      );
    }
    
    // Type filter
    if (typeFilter === "gift") {
      filtered = filtered.filter(order =>
        order.cards?.some(card => card.isGift)
      );
    } else if (typeFilter === "self") {
      filtered = filtered.filter(order =>
        order.cards?.some(card => !card.isGift)
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect passcode. Please try again.");
    }
  };

  const openEditModal = (card, isBonus = false) => {
    setSelectedCard({ ...card, isBonus });
    setEditCode("");
    setEditAmount(card.remainingAmount.toString());
    setEditError("");
    setEditSuccess("");
  };

  const closeEditModal = () => {
    setSelectedCard(null);
    setEditCode("");
    setEditAmount("");
    setEditError("");
    setEditSuccess("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");

    try {
      const response = await fetch("/api/giftcard/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: selectedCard._id,
          code: editCode,
          newAmount: parseFloat(editAmount)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update card");
      }

      setEditSuccess("Card updated successfully!");
      fetchOrders();
      
      setTimeout(() => {
        closeEditModal();
      }, 1500);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Create card handlers
  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateName("");
    setCreateEmail("");
    setCreateAmount("");
    setCreateMessage("");
    setCreateSendEmail(true);
    setCreateError("");
    setCreateSuccess("");
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateName("");
    setCreateEmail("");
    setCreateAmount("");
    setCreateMessage("");
    setCreateError("");
    setCreateSuccess("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const response = await fetch("/api/giftcard/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: createName,
          ownerEmail: createEmail,
          amount: parseFloat(createAmount),
          personalMessage: createMessage,
          sendEmail: createSendEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create card");
      }

      setCreateSuccess(`Card created! Code: ${data.card.code}`);
      fetchOrders();
      
      setTimeout(() => {
        closeCreateModal();
      }, 2000);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete card handlers
  const openDeleteModal = (card) => {
    setDeleteCard(card);
    setDeleteCode("");
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    setDeleteCard(null);
    setDeleteCode("");
    setDeleteError("");
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const response = await fetch(
        `/api/giftcard/admin?cardId=${deleteCard._id}&code=${deleteCode}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete card");
      }

      fetchOrders();
      closeDeleteModal();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fef9f3] to-white">
        <form onSubmit={handlePasscodeSubmit} className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-[#d88728] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-3xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Gift Card Super Admin</h2>
          <p className="text-gray-500 mb-6">Enter passcode to continue</p>
          <input
            type="password"
            maxLength={6}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="border-2 border-gray-200 px-4 py-3 rounded-lg w-full text-center text-2xl tracking-widest mb-4 focus:outline-none focus:border-[#d88728]"
            placeholder="••••••"
          />
          <button
            type="submit"
            className="bg-[#d88728] hover:bg-[#c07a24] text-white w-full py-3 rounded-lg font-semibold text-lg transition-all"
          >
            Access Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gift Card Super Admin</h1>
            <p className="text-gray-400 text-sm">Full access - Create, Edit, Delete gift cards</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={openCreateModal}
              className="bg-[#d88728] hover:bg-[#c07a24] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Card
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Cards</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalCards}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-[#d88728]">${stats.totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Remaining</p>
            <p className="text-2xl font-bold text-green-600">${stats.totalRemaining.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Redeemed</p>
            <p className="text-2xl font-bold text-blue-600">${stats.totalRedeemed.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d88728]"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d88728]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d88728]"
              >
                <option value="all">All Types</option>
                <option value="gift">Gift Only</option>
                <option value="self">Self Only</option>
              </select>
              <button
                onClick={fetchOrders}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#d88728] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gift cards...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <i className="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-credit-card text-4xl mb-4"></i>
            <p>No gift cards found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <p className="font-mono text-sm text-gray-500">{order.orderId}</p>
                      <p className="font-semibold text-gray-800">{order.buyerName}</p>
                      <p className="text-sm text-gray-500">{order.buyerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {moment(order.createdAt).format('MMM DD, YYYY h:mm A')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.cards?.map((card, cardIndex) => (
                      <div key={cardIndex}>
                        {/* Main Card */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                              card.status === 'active' ? 'bg-green-100 text-green-600' :
                              card.status === 'redeemed' ? 'bg-gray-100 text-gray-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              <i className="fas fa-gift text-2xl"></i>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-mono font-bold text-lg text-[#d88728]">{card.code}</p>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                card.status === 'active' ? 'bg-green-100 text-green-700' :
                                card.status === 'redeemed' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {card.status}
                              </span>
                              {card.isGift && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 text-xs rounded-full">
                                  Gift
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>For:</strong> {card.ownerName} ({card.ownerEmail})
                            </p>
                            {card.personalMessage && (
                              <p className="text-sm text-gray-500 italic mt-1">"{card.personalMessage}"</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Balance</p>
                              <p className="text-xl font-bold">
                                <span className={card.remainingAmount === 0 ? 'text-gray-400' : 'text-green-600'}>
                                  ${card.remainingAmount.toFixed(2)}
                                </span>
                                <span className="text-gray-400 text-sm"> / ${card.originalAmount.toFixed(2)}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => openEditModal(card)}
                              className="bg-[#d88728] hover:bg-[#c07a24] text-white px-3 py-2 rounded-lg font-medium transition-colors"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(card)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Bonus Card */}
                        {card.bonusCard && (
                          <div className="ml-8 mt-2 flex flex-col md:flex-row md:items-center gap-4 p-4 border border-[#d88728] bg-[#fef9f3] rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-lg bg-[#d88728] text-white flex items-center justify-center">
                                <i className="fas fa-star text-2xl"></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-mono font-bold text-lg text-[#d88728]">{card.bonusCard.code}</p>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  card.bonusCard.status === 'active' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {card.bonusCard.status}
                                </span>
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs rounded-full">
                                  Bonus
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                <strong>For:</strong> {card.bonusCard.ownerName} ({card.bonusCard.ownerEmail})
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Balance</p>
                                <p className="text-xl font-bold">
                                  <span className={card.bonusCard.remainingAmount === 0 ? 'text-gray-400' : 'text-green-600'}>
                                    ${card.bonusCard.remainingAmount.toFixed(2)}
                                  </span>
                                  <span className="text-gray-400 text-sm"> / ${card.bonusCard.originalAmount.toFixed(2)}</span>
                                </p>
                              </div>
                              <button
                                onClick={() => openEditModal(card.bonusCard, true)}
                                className="bg-[#d88728] hover:bg-[#c07a24] text-white px-3 py-2 rounded-lg font-medium transition-colors"
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(card.bonusCard)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Edit Gift Card</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-6">
                <div className={`p-4 rounded-lg ${selectedCard.isBonus ? 'bg-[#fef9f3] border border-[#d88728]' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedCard.isBonus ? 'bg-[#d88728] text-white' : 'bg-green-100 text-green-600'
                    }`}>
                      <i className={`fas ${selectedCard.isBonus ? 'fa-star' : 'fa-gift'} text-xl`}></i>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-[#d88728]">{selectedCard.code}</p>
                      <p className="text-sm text-gray-600">{selectedCard.ownerName}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Original: <strong>${selectedCard.originalAmount.toFixed(2)}</strong> | 
                      Current: <strong>${selectedCard.remainingAmount.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Card Code to Verify *
                </label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d88728] font-mono text-center tracking-widest uppercase"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Amount ($)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d88728] text-center text-xl"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {editError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  {editSuccess}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-[#d88728] hover:bg-[#c07a24] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {editLoading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Create New Gift Card</h3>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Create a card without payment (complimentary)</p>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d88728]"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d88728]"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Amount ($) *
                </label>
                <input
                  type="number"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d88728] text-center text-xl"
                  placeholder="50"
                  min="1"
                  max="1000"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  value={createMessage}
                  onChange={(e) => setCreateMessage(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d88728]"
                  placeholder="Enjoy your complimentary gift card!"
                  rows={3}
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createSendEmail}
                    onChange={(e) => setCreateSendEmail(e.target.checked)}
                    className="w-5 h-5 accent-[#d88728]"
                  />
                  <span className="text-sm text-gray-700">
                    Send email notification to recipient
                  </span>
                </label>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  {createSuccess}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-[#d88728] hover:bg-[#c07a24] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {createLoading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Creating...
                    </span>
                  ) : (
                    "Create Card"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-red-600">Delete Gift Card</h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleDeleteSubmit} className="p-6">
              <div className="mb-6">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-xl"></i>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-red-600">{deleteCard.code}</p>
                      <p className="text-sm text-gray-600">{deleteCard.ownerName}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm text-red-600 font-medium">
                      Balance: ${deleteCard.remainingAmount?.toFixed(2)} / ${deleteCard.originalAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 mt-3">
                  <i className="fas fa-warning mr-1"></i>
                  This action cannot be undone. The card will be permanently deleted.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Card Code to Confirm *
                </label>
                <input
                  type="text"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value.toUpperCase())}
                  className="w-full border-2 border-red-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-center tracking-widest uppercase"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                />
              </div>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {deleteLoading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Deleting...
                    </span>
                  ) : (
                    "Delete Card"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

