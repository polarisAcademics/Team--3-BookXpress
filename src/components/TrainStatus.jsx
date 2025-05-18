import React, { useState } from 'react';

function TrainStatus() {
    const [trainNumber, setTrainNumber] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [trainStatus, setTrainStatus] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const formattedDate = date.replace(/-/g, '');
            const response = await fetch(`/api/trainstatus?trainNumber=${trainNumber}&date=${formattedDate}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch train status');
            }
            
            setTrainStatus(data);
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
                <p className="text-gray-400">Track your train's current location and expected arrival time</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                            Journey Date
                        </label>
                        <div className="relative">
                            <i className="fas fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-[#2a3147] text-white pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] transition-all duration-200"
                                required
                            />
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
                    <div className="bg-[#2a3147] rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-gray-400 text-sm">Train Name</p>
                                <p className="text-white font-medium">{trainStatus.trainName}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Current Station</p>
                                <p className="text-white font-medium">{trainStatus.currentStation}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Expected Arrival</p>
                                <p className="text-white font-medium">{trainStatus.expectedArrival}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Delay</p>
                                <p className={`font-medium ${trainStatus.delay === 'On Time' ? 'text-green-500' : 'text-red-500'}`}>
                                    {trainStatus.delay}
                                </p>
                            </div>
                        </div>

                        {trainStatus.stations && (
                            <div className="mt-6">
                                <h4 className="text-lg font-medium text-white mb-4">Journey Progress</h4>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#4a6cf7]"></div>
                                    {trainStatus.stations.map((station, index) => (
                                        <div key={index} className="relative pl-10 pb-6 last:pb-0">
                                            <div className={`absolute left-3 w-3 h-3 rounded-full transform -translate-x-1/2 ${
                                                station.passed ? 'bg-[#4a6cf7]' : 'bg-gray-600'
                                            }`}></div>
                                            <div className="bg-[#343e57] rounded-lg p-4">
                                                <p className="text-white font-medium">{station.name}</p>
                                                <div className="flex justify-between mt-2 text-sm">
                                                    <span className="text-gray-400">
                                                        Scheduled: {station.scheduledTime}
                                                    </span>
                                                    <span className={station.passed ? 'text-green-500' : 'text-gray-400'}>
                                                        {station.passed ? 'Departed' : 'Expected'}: {station.actualTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TrainStatus; 