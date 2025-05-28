import React, { useState } from 'react';
import { trainsService } from '../services/trains.service';
import '../styles/TrainSearch.css';

const TrainSearch = () => {
  const [formData, setFormData] = useState({
    fromStation: '',
    toStation: '',
    date: ''
  });
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await trainsService.getTrainsBetweenStations(
        formData.fromStation,
        formData.toStation,
        formData.date
      );
      setTrains(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="train-search-container">
      <h2>Search Trains</h2>
      <form onSubmit={handleSubmit} className="train-search-form">
        <div className="form-group">
          <label htmlFor="fromStation">From Station Code:</label>
          <input
            type="text"
            id="fromStation"
            name="fromStation"
            value={formData.fromStation}
            onChange={handleChange}
            placeholder="e.g., BVI"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="toStation">To Station Code:</label>
          <input
            type="text"
            id="toStation"
            name="toStation"
            value={formData.toStation}
            onChange={handleChange}
            placeholder="e.g., NDLS"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date of Journey:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Trains'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {trains.length > 0 && (
        <div className="trains-list">
          <h3>Available Trains</h3>
          <div className="trains-grid">
            {trains.map((train) => (
              <div key={train.trainNumber} className="train-card">
                <h4>{train.trainName}</h4>
                <p>Train Number: {train.trainNumber}</p>
                <p>From: {train.fromStationName}</p>
                <p>To: {train.toStationName}</p>
                <p>Departure: {train.departureTime}</p>
                <p>Arrival: {train.arrivalTime}</p>
                <p>Duration: {train.duration}</p>
                <button onClick={() => {/* Handle booking */}}>
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainSearch; 