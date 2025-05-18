import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookTickets() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTrain, selectedClass } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    berthPreference: '',
    email: '',
    phone: '',
  });

  // If no train data is passed, redirect to home
  useEffect(() => {
    if (!selectedTrain) {
      navigate('/');
    }
  }, [selectedTrain, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle booking submission
    console.log('Booking submitted:', { selectedTrain, selectedClass, formData });
    // You can add your booking logic here
  };

  if (!selectedTrain) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#1e2535] rounded-lg p-6 mb-6">
        <h2 className="text-white text-xl font-semibold mb-4">Train Details</h2>
        <div className="grid grid-cols-2 gap-4 text-white">
          <div>
            <p className="text-[#7a8bbf]">Train</p>
            <p className="font-semibold">{selectedTrain.name} ({selectedTrain.id})</p>
          </div>
          <div>
            <p className="text-[#7a8bbf]">Class</p>
            <p className="font-semibold">{selectedClass}</p>
          </div>
          <div>
            <p className="text-[#7a8bbf]">From</p>
            <p className="font-semibold">{selectedTrain.from}</p>
          </div>
          <div>
            <p className="text-[#7a8bbf]">To</p>
            <p className="font-semibold">{selectedTrain.to}</p>
          </div>
          <div>
            <p className="text-[#7a8bbf]">Departure</p>
            <p className="font-semibold">{selectedTrain.departure}</p>
          </div>
          <div>
            <p className="text-[#7a8bbf]">Arrival</p>
            <p className="font-semibold">{selectedTrain.arrival}</p>
          </div>
          <div>
            <p className="text-[#7a8bbf]">Duration</p>
            <p className="font-semibold">{selectedTrain.duration}</p>
          </div>
          <div>
            <p className="text-[#7a8bbf]">Fare</p>
            <p className="font-semibold">₹{selectedTrain.fare[selectedClass]}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1e2535] rounded-lg p-6">
        <h2 className="text-white text-xl font-semibold mb-6">Passenger Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label className="block text-[#7a8bbf] mb-2">Full Name</label>
                <input
                  type="text"
              name="name"
              value={formData.name}
                  onChange={handleChange}
                  required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
                />
            </div>

            <div>
            <label className="block text-[#7a8bbf] mb-2">Age</label>
                <input
              type="number"
              name="age"
              value={formData.age}
                  onChange={handleChange}
                  required
              min="1"
              max="120"
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
                />
            </div>

            <div>
            <label className="block text-[#7a8bbf] mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
                  onChange={handleChange}
                  required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            </div>

              <div>
            <label className="block text-[#7a8bbf] mb-2">Berth Preference</label>
                <select
              name="berthPreference"
              value={formData.berthPreference}
                  onChange={handleChange}
              required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            >
              <option value="">Select Preference</option>
              <option value="lower">Lower</option>
              <option value="middle">Middle</option>
              <option value="upper">Upper</option>
              <option value="side_lower">Side Lower</option>
              <option value="side_upper">Side Upper</option>
                </select>
              </div>

              <div>
            <label className="block text-[#7a8bbf] mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
                  onChange={handleChange}
              required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-[#7a8bbf] mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-3 rounded font-semibold"
          >
            Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookTickets; 