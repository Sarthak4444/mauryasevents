"use client";
import { useEffect, useState, useRef } from "react";

export default function EmployeePanelPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  
  // Manual entry state
  const [manualCode, setManualCode] = useState("");
  
  // Card lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [foundCard, setFoundCard] = useState(null);
  
  // Deduction state
  const [deductAmount, setDeductAmount] = useState("");
  const [deductNote, setDeductNote] = useState("");
  const [deductLoading, setDeductLoading] = useState(false);
  const [deductError, setDeductError] = useState("");
  const [deductSuccess, setDeductSuccess] = useState(null);
  
  // Transaction history for current session
  const [transactions, setTransactions] = useState([]);

  const correctPasscode = "1234"; // Simple employee passcode

  // Initialize and cleanup QR scanner
  useEffect(() => {
    if (scannerActive && isAuthenticated) {
      initScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [scannerActive, isAuthenticated]);

  const initScanner = async () => {
    if (!scannerRef.current) return;
    
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          handleCodeScanned(decodedText);
        },
        (errorMessage) => {
          // Scanning in progress, ignore errors
        }
      );
      
      setScannerError("");
    } catch (err) {
      console.error("Scanner error:", err);
      setScannerError("Camera access denied or not available. Please use manual entry.");
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleCodeScanned = async (code) => {
    // Stop scanner after successful scan
    await stopScanner();
    setScannerActive(false);
    
    // Look up the card
    lookupCard(code.toUpperCase().trim());
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect passcode. Please try again.");
    }
  };

  const lookupCard = async (code) => {
    if (!code || code.length !== 8) {
      setLookupError("Please enter a valid 8-character code");
      return;
    }
    
    setLookupLoading(true);
    setLookupError("");
    setFoundCard(null);
    setDeductSuccess(null);
    
    try {
      const response = await fetch(`/api/giftcard/employee?code=${code}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Card not found");
      }
      
      setFoundCard(data.card);
      setDeductAmount("");
      setDeductNote("");
    } catch (err) {
      setLookupError(err.message);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    lookupCard(manualCode.toUpperCase().trim());
    setManualCode("");
  };

  const handleDeduct = async (e) => {
    e.preventDefault();
    
    if (!foundCard || !deductAmount) return;
    
    const amount = parseFloat(deductAmount);
    if (amount <= 0) {
      setDeductError("Amount must be greater than 0");
      return;
    }
    
    if (amount > foundCard.remainingAmount) {
      setDeductError(`Amount exceeds balance ($${foundCard.remainingAmount.toFixed(2)})`);
      return;
    }
    
    setDeductLoading(true);
    setDeductError("");
    
    try {
      const response = await fetch("/api/giftcard/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: foundCard.code,
          deductAmount: amount,
          note: deductNote
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Transaction failed");
      }
      
      // Update the found card with new balance
      setFoundCard(prev => ({
        ...prev,
        remainingAmount: data.transaction.newBalance,
        status: data.transaction.status
      }));
      
      // Add to transaction history
      setTransactions(prev => [{
        ...data.transaction,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev]);
      
      setDeductSuccess(data.transaction);
      setDeductAmount("");
      setDeductNote("");
    } catch (err) {
      setDeductError(err.message);
    } finally {
      setDeductLoading(false);
    }
  };

  const clearCard = () => {
    setFoundCard(null);
    setDeductAmount("");
    setDeductNote("");
    setDeductError("");
    setDeductSuccess(null);
    setLookupError("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-white">
        <form onSubmit={handlePasscodeSubmit} className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-user-tie text-3xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Employee Panel</h2>
          <p className="text-gray-500 mb-6">Enter employee passcode</p>
          <input
            type="password"
            maxLength={4}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="border-2 border-gray-200 px-4 py-3 rounded-lg w-full text-center text-2xl tracking-widest mb-4 focus:outline-none focus:border-green-600"
            placeholder="••••"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-lg font-semibold text-lg transition-all"
          >
            Access Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Employee Panel</h1>
            <p className="text-green-100 text-sm">Gift Card Redemption</p>
          </div>
          <button
            onClick={() => {
              stopScanner();
              setIsAuthenticated(false);
            }}
            className="text-green-100 hover:text-white transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Card Lookup Section */}
        {!foundCard && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold mb-4">Look Up Gift Card</h2>
            
            {/* Scanner Toggle */}
            <div className="mb-4">
              <button
                onClick={() => {
                  if (scannerActive) {
                    stopScanner();
                    setScannerActive(false);
                  } else {
                    setScannerActive(true);
                  }
                }}
                className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  scannerActive 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                <i className={`fas ${scannerActive ? 'fa-stop' : 'fa-qrcode'} text-xl`}></i>
                {scannerActive ? 'Stop Scanner' : 'Scan QR Code'}
              </button>
            </div>

            {/* QR Scanner */}
            {scannerActive && (
              <div className="mb-4">
                <div 
                  id="qr-reader" 
                  ref={scannerRef}
                  className="w-full rounded-lg overflow-hidden"
                  style={{ minHeight: '300px' }}
                ></div>
                {scannerError && (
                  <p className="text-red-600 text-sm mt-2 text-center">{scannerError}</p>
                )}
              </div>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or enter code manually</span>
              </div>
            </div>

            {/* Manual Entry */}
            <form onSubmit={handleManualLookup}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-600 font-mono text-center text-xl tracking-widest uppercase"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                />
                <button
                  type="submit"
                  disabled={lookupLoading || manualCode.length !== 8}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {lookupLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-search"></i>
                  )}
                </button>
              </div>
            </form>

            {lookupError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {lookupError}
              </div>
            )}
          </div>
        )}

        {/* Found Card Display */}
        {foundCard && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            {/* Card Header */}
            <div className={`p-4 ${foundCard.status === 'active' ? 'bg-green-50' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono font-bold text-2xl text-[#d88728]">{foundCard.code}</p>
                  <p className="text-gray-600">{foundCard.ownerName}</p>
                  <p className="text-gray-500 text-sm">{foundCard.ownerEmail}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    foundCard.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {foundCard.status.toUpperCase()}
                  </span>
                  {foundCard.isBonus && (
                    <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                      BONUS
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Balance Display */}
            <div className="p-6 text-center border-b border-gray-200">
              <p className="text-gray-500 text-sm">Available Balance</p>
              <p className={`text-5xl font-bold ${
                foundCard.remainingAmount === 0 ? 'text-gray-400' : 'text-green-600'
              }`}>
                ${foundCard.remainingAmount.toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                of ${foundCard.originalAmount.toFixed(2)} original
              </p>
            </div>

            {/* Deduction Form */}
            {foundCard.status === 'active' && foundCard.remainingAmount > 0 && (
              <form onSubmit={handleDeduct} className="p-6">
                <h3 className="font-bold mb-4">Deduct Amount</h3>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[10, 20, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDeductAmount(Math.min(amt, foundCard.remainingAmount).toString())}
                      disabled={amt > foundCard.remainingAmount}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        amt > foundCard.remainingAmount
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Deduct ($) *
                  </label>
                  <input
                    type="number"
                    value={deductAmount}
                    onChange={(e) => setDeductAmount(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-600 text-center text-2xl"
                    placeholder="0.00"
                    min="0.01"
                    max={foundCard.remainingAmount}
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={deductNote}
                    onChange={(e) => setDeductNote(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                    placeholder="e.g., Table 5, Dinner"
                  />
                </div>

                {deductError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {deductError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={deductLoading || !deductAmount}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  {deductLoading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </span>
                  ) : (
                    `Deduct $${deductAmount || '0.00'}`
                  )}
                </button>
              </form>
            )}

            {/* Success Message */}
            {deductSuccess && (
              <div className="p-4 bg-green-50 border-t border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="font-bold text-green-700">Transaction Complete!</p>
                    <p className="text-sm text-green-600">
                      Deducted ${deductSuccess.deductedAmount.toFixed(2)} | 
                      New Balance: ${deductSuccess.newBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Clear Button */}
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={clearCard}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Look Up Another Card
              </button>
            </div>
          </div>
        )}

        {/* Session Transaction History */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold mb-4">Session History</h3>
            <div className="space-y-2">
              {transactions.slice(0, 10).map((tx, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-mono text-sm text-[#d88728]">{tx.code}</p>
                    <p className="text-xs text-gray-500">{tx.ownerName} • {tx.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">-${tx.deductedAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Bal: ${tx.newBalance.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
