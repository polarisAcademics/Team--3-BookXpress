import React, { useState } from 'react';

function BookTickets() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    class: 'SL', // Default to Sleeper Class
    quota: 'GN', // Default to General Quota
  });

  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState([]);
  const [error, setError] = useState('');

  const classes = [
    { value: 'SL', label: 'Sleeper Class' },
    { value: '3A', label: '3rd AC' },
    { value: '2A', label: '2nd AC' },
    { value: '1A', label: '1st AC' },
    { value: 'CC', label: 'Chair Car' },
  ];

  const quotas = [
    { value: 'GN', label: 'General' },
    { value: 'TQ', label: 'Tatkal' },
    { value: 'LD', label: 'Ladies' },
    { value: 'SS', label: 'Senior Citizen' },
    { value: 'HD', label: 'Divyangjan' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement API call to search trains
      const response = await fetch('/api/search-trains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search trains');
      }

      setTrains(data.trains);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#1e2535] rounded-lg shadow-xl p-6 mb-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Book Train Tickets</h2>
          <p className="text-gray-400">Search trains and book your tickets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-gray-300 mb-2">
                From Station
              </label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  id="from"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  className="bg-[#2a3147] text-white pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] transition-all duration-200"
                  placeholder="Enter source station"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-300 mb-2">
                To Station
              </label>
              <div className="relative">
                <i className="fas fa-map-marker absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  id="to"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  className="bg-[#2a3147] text-white pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] transition-all duration-200"
                  placeholder="Enter destination station"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Journey Date
              </label>
              <div className="relative">
                <i className="fas fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-[#2a3147] text-white pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-300 mb-2">
                  Class
                </label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="bg-[#2a3147] text-white px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] transition-all duration-200"
                >
                  {classes.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quota" className="block text-sm font-medium text-gray-300 mb-2">
                  Quota
                </label>
                <select
                  id="quota"
                  name="quota"
                  value={formData.quota}
                  onChange={handleChange}
                  className="bg-[#2a3147] text-white px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] transition-all duration-200"
                >
                  {quotas.map(q => (
                    <option key={q.value} value={q.value}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a6cf7] hover:bg-[#3b63f7] text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <i className="fas fa-search"></i>
                <span>Search Trains</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-8">
          <p className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </p>
        </div>
      )}

      {trains.length > 0 && (
        <div className="bg-[#1e2535] rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Available Trains</h3>
          <div className="space-y-4">
            {trains.map((train) => (
              <div key={train.number} className="bg-[#2a3147] rounded-lg p-4 hover:bg-[#343e57] transition-colors duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-medium">{train.name}</h4>
                    <p className="text-gray-400 text-sm">{train.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#4a6cf7] font-medium">₹{train.fare}</p>
                    <p className="text-gray-400 text-sm">{train.availability} seats left</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Departure</p>
                    <p className="text-white">{train.departure}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Arrival</p>
                    <p className="text-white">{train.arrival}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white">{train.duration}</p>
                  </div>
                  <div className="flex justify-end items-center">
                    <button
                      onClick={() => {/* TODO: Implement booking */}}
                      className="bg-[#4a6cf7] hover:bg-[#3b63f7] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookTickets; 