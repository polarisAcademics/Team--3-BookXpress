import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:3000';

function TrainStatus() {
    const [trainNumber, setTrainNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [trainStatus, setTrainStatus] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTrainStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/trainstatus?trainNumber=${trainNumber}`);
            const data = await response.json();
            console.log('API response:', data);
            const trainData = data.body?.[0]?.trains?.[0];
            if (!response.ok || !trainData) {
                throw new Error('No train data found. Please check the train number and try again.');
            }
            setTrainStatus(trainData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1e2535] rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Live Train Status</h2>
                <p className="text-gray-400">Track your train's schedule and route</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="trainNumber" className="block text-sm font-medium text-gray-300 mb-2">
                        Train Number
                    </label>
                    <div className="relative">
                        <i className="fas fa-train absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            id="trainNumber"
                            value={trainNumber}
                            onChange={(e) => setTrainNumber(e.target.value)}
                            className="bg-[#2a3147] text-white pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] transition-all duration-200"
                            placeholder="Enter train number"
                            required
                        />
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
                            <span>Checking Status...</span>
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
                <div className="mt-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    <p className="flex items-center">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {error}
                    </p>
                </div>
            )}

            {trainStatus && !error && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Train Information</h3>
                    <div className="bg-[#2a3147] rounded-lg p-6 space-y-4">
                        <div>
                            <p className="text-gray-400 text-sm">Train Number</p>
                            <p className="text-white font-medium">{trainStatus.trainNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Train Name</p>
                            <p className="text-white font-medium">{trainStatus.trainName}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">From</p>
                            <p className="text-white font-medium">{trainStatus.origin} ({trainStatus.stationFrom})</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">To</p>
                            <p className="text-white font-medium">{trainStatus.destination} ({trainStatus.stationTo})</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Journey Classes</p>
                            <p className="text-white font-medium">{trainStatus.journeyClasses?.join(', ')}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Schedule</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs text-white">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-1">Station</th>
                                            <th className="px-2 py-1">Arrival</th>
                                            <th className="px-2 py-1">Departure</th>
                                            <th className="px-2 py-1">Distance (km)</th>
                                            <th className="px-2 py-1">Day</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trainStatus.schedule?.map((stop, idx) => (
                                            <tr key={idx}>
                                                <td className="px-2 py-1">{stop.stationName} ({stop.stationCode})</td>
                                                <td className="px-2 py-1">{stop.arrivalTime}</td>
                                                <td className="px-2 py-1">{stop.departureTime}</td>
                                                <td className="px-2 py-1">{stop.distance}</td>
                                                <td className="px-2 py-1">{stop.dayCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TrainStatus;