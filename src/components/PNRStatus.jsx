import React, { useState } from 'react';

// PNR status checker component with journey and passenger details
function PNRStatus() {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pnrStatus, setPnrStatus] = useState(null);

  // Fetch and display PNR status from API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPnrStatus(null);
    setLoading(true);

    console.log('Submitting PNR check for:', pnr);

    try {
      const response = await fetch(`http://localhost:3000/api/pnr-status?pnr=${pnr}`);
      const data = await response.json();

      console.log('Received PNR status response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch PNR status');
      }

      setPnrStatus(data);
      console.log('PNR status updated:', data);
    } catch (err) {
      console.error('Error fetching PNR status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePnrChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPnr(value);
      console.log('PNR input updated:', value);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return dateString;
    }
  };

  return (
    <section className="bg-[#1e2535] rounded-md shadow-md">
      <h3 className="bg-[#3b63f7] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        PNR Status
      </h3>
      <form className="p-4 space-y-3" onSubmit={handleSubmit}>
        <label htmlFor="pnr" className="block text-xs sm:text-sm text-white/80 mb-1">Enter PNR Number</label>
        <input
          id="pnr"
          type="text"
          value={pnr}
          onChange={handlePnrChange}
          placeholder="10-digit PNR number"
          className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
          maxLength={10}
          pattern="[0-9]{10}"
          required
        />
        <button
          type="submit"
          disabled={loading || pnr.length !== 10}
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded py-2 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Checking...</span>
            </>
          ) : (
            <>
              <i className="fas fa-search"></i>
              <span>Check Status</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="px-4 pb-4">
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative text-xs sm:text-sm">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {pnrStatus && pnrStatus.data && (
        <div className="px-4 pb-4">
          <div className="bg-[#2a3147] rounded-md p-4 space-y-3">
            {/* Journey Details */}
            <div className="border-b border-white/10 pb-3">
              <h4 className="text-white font-semibold text-sm mb-2">Journey Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">PNR Number</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">{pnrStatus.data.pnrNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">Date of Journey</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {formatDate(pnrStatus.data.dateOfJourney)}
                  </span>
                </div>
              </div>
            </div>

            {/* Train Details */}
            <div className="border-b border-white/10 pb-3">
              <h4 className="text-white font-semibold text-sm mb-2">Train Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">Train Number</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">{pnrStatus.data.trainNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">Train Name</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">{pnrStatus.data.trainName}</span>
                </div>
              </div>
            </div>

            {/* Station Details */}
            <div className="border-b border-white/10 pb-3">
              <h4 className="text-white font-semibold text-sm mb-2">Station Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">From</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">{pnrStatus.data.sourceStation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">To</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">{pnrStatus.data.destinationStation}</span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Status Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">Class</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">{pnrStatus.data.journeyClass}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">Chart Status</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">{pnrStatus.data.chartStatus}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">Passenger Status</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {pnrStatus.data.passengerList && pnrStatus.data.passengerList[0]?.currentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs sm:text-sm">Last Updated</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {formatDate(pnrStatus.generatedTimeStamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PNRStatus;