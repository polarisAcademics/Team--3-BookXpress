import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

function PNRStatus() {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pnrStatus, setPnrStatus] = useState(null);
  const { isDarkMode } = useTheme();

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
    <section className="bg-theme-secondary rounded-md shadow-md">
      <h3 className="bg-[var(--accent-color)] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        PNR Status
      </h3>
      <form className="p-4 space-y-3" onSubmit={handleSubmit}>
        <label htmlFor="pnr" className="block text-xs sm:text-sm text-theme-primary mb-1">Enter PNR Number</label>
        <input
          id="pnr"
          type="text"
          value={pnr}
          onChange={handlePnrChange}
          placeholder="10-digit PNR number"
          className="w-full bg-theme-primary text-theme-primary text-xs sm:text-sm rounded px-3 py-2 placeholder:text-theme-secondary"
          maxLength={10}
          pattern="[0-9]{10}"
          required
        />
        <button
          type="submit"
          disabled={loading || pnr.length !== 10}
          className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] transition rounded py-2 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className={`rounded-md p-4 space-y-3 ${isDarkMode ? 'bg-[#2a3147] text-white' : 'bg-white text-gray-900'}`}>
            {/* Journey Details */}
            <div className="border-b border-white/10 pb-3">
              <h4 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Journey Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>PNR Number</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pnrStatus.data.pnrNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>Date of Journey</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(pnrStatus.data.dateOfJourney)}
                  </span>
                </div>
              </div>
            </div>

            {/* Train Details */}
            <div className="border-b border-white/10 pb-3">
              <h4 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Train Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>Train Number</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pnrStatus.data.trainNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>Train Name</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pnrStatus.data.trainName}</span>
                </div>
              </div>
            </div>

            {/* Station Details */}
            <div className="border-b border-white/10 pb-3">
              <h4 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Station Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>From</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pnrStatus.data.sourceStation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>To</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pnrStatus.data.destinationStation}</span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <h4 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>Class</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pnrStatus.data.journeyClass}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>Chart Status</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pnrStatus.data.chartStatus}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>Passenger Status</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {pnrStatus.data.passengerList && pnrStatus.data.passengerList[0]?.currentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-xs sm:text-sm`}>Last Updated</span>
                  <span className={`font-semibold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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