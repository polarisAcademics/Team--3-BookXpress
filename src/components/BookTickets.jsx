import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function BookTickets() {
  const location = useLocation();
  // Receive selected train details, class, and appliedDiscount from navigation state
  const { selectedTrain, selectedClass, appliedDiscount } = location.state || {};

  const [formData, setFormData] = useState({
    passengers: [
      { name: '', age: '', gender: 'male', berthPreference: 'lower' }
    ],
    contact: {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  });

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      passengers: updatedPassengers
    }));
  };

  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const addPassenger = () => {
    setFormData(prev => ({
      ...prev,
      passengers: [
        ...prev.passengers,
        { name: '', age: '', gender: 'male', berthPreference: 'lower' }
      ]
    }));
  };

  const removePassenger = (index) => {
    setFormData(prev => ({
      ...prev,
      passengers: prev.passengers.filter((_, i) => i !== index)
    }));
  };

  const calculateFare = () => {
    if (!selectedTrain || !selectedClass) return 0;
    const baseFarePerPassenger = selectedTrain.fare[selectedClass] || selectedTrain.fare['3A'];
    let totalBaseFare = baseFarePerPassenger * formData.passengers.length;

    if (appliedDiscount && appliedDiscount.type === 'percent') {
      totalBaseFare = totalBaseFare * (1 - appliedDiscount.value / 100);
    } else if (appliedDiscount && appliedDiscount.type === 'flat') {
      totalBaseFare = totalBaseFare - appliedDiscount.value;
      if (totalBaseFare < 0) totalBaseFare = 0; // Ensure fare doesn't go below zero
    }

    return Math.round(totalBaseFare);
  };

  const handlePayment = () => {
    // Implement payment gateway integration here
    console.log('Processing payment for booking:', {
      train: selectedTrain,
      passengers: formData.passengers,
      contact: formData.contact,
      fare: calculateFare(),
      appliedDiscount: appliedDiscount // Include discount in log
    });
    alert('Proceeding to payment with details logged to console.');
    // In a real app, you would integrate with a payment gateway here
  };

  // Display selected train details if available
  if (!selectedTrain) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-white text-2xl font-semibold mb-4">No Train Selected</h1>
        <p className="text-[#7a8bbf]">Please search and select a train first to proceed with booking.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-white text-2xl font-semibold mb-6">Book Train Tickets</h1>

      {/* Display selected train details */}
      <div className="bg-[#2a3147] rounded-lg p-4 mb-6 text-white">
        <h3 className="font-semibold text-lg">{selectedTrain.name} ({selectedTrain.id})</h3>
        <p className="text-sm text-[#7a8bbf]">Route: {selectedTrain.from} to {selectedTrain.to}</p>
        <p className="text-sm text-[#7a8bbf]">Class: {selectedClass}</p>
        {/* Add date display if selectedTrain includes it */}
        {selectedTrain.date && <p className="text-sm text-[#7a8bbf]">Date: {selectedTrain.date}</p>}
      </div>

      {/* Booking Form with Passenger/Contact Details and Fare Summary */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-[#1e2535] rounded-lg p-6 space-y-6">
        {/* Passenger Details Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white text-lg font-semibold">Passenger Details</h3>
            <button
              type="button"
              onClick={addPassenger}
              className="bg-[#3b63f7] hover:bg-[#2f54e0] text-white px-4 py-2 rounded text-sm"
            >
              Add Passenger
            </button>
          </div>
          
          {formData.passengers.map((passenger, index) => (
            <div key={index} className="bg-[#2a3147] p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-medium">Passenger {index + 1}</h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removePassenger(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#7a8bbf] mb-2">Name</label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    required
                    className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[#7a8bbf] mb-2">Age</label>
                  <input
                    type="number"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                    required
                    min="1"
                    max="120"
                    className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[#7a8bbf] mb-2">Gender</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#7a8bbf] mb-2">Berth Preference</label>
                  <select
                    value={passenger.berthPreference}
                    onChange={(e) => handlePassengerChange(index, 'berthPreference', e.target.value)}
                    className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                  >
                    <option value="lower">Lower</option>
                    <option value="middle">Middle</option>
                    <option value="upper">Upper</option>
                    <option value="side-lower">Side Lower</option>
                    <option value="side-upper">Side Upper</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">Contact Information</h3>
          <div className="bg-[#2a3147] p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#7a8bbf] mb-2">Name</label>
                <input
                  type="text"
                  value={formData.contact.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  required
                  className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[#7a8bbf] mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  required
                  className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[#7a8bbf] mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  required
                  className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[#7a8bbf] mb-2">Address</label>
                <input
                  type="text"
                  value={formData.contact.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                  required
                  className="w-full bg-[#1e2535] text-white rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fare Summary */}
        <div className="bg-[#2a3147] p-4 rounded-lg">
          <h3 className="text-white text-lg font-semibold mb-4">Fare Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[#7a8bbf]">
              <span>Base Fare ({formData.passengers.length} passengers)</span>
              {/* Display original base fare before discount */}
              <span>₹{Math.round((selectedTrain?.fare[selectedClass] || selectedTrain?.fare['3A']) * formData.passengers.length)}</span>
            </div>
            {/* Display discount details if applied */}
            {appliedDiscount && (
              <div className="flex justify-between text-green-400">
                {appliedDiscount.type === 'percent' ? (
                  <span>Applied Discount ({appliedDiscount.value}%)</span>
                ) : (
                  <span>Applied Discount (Flat ₹{appliedDiscount.value})</span>
                )}
                {/* Calculate and display the discount amount */}
                <span>
                  - ₹{
                    appliedDiscount.type === 'percent'
                      ? Math.round(
                          (selectedTrain?.fare[selectedClass] || selectedTrain?.fare['3A']) *
                            formData.passengers.length *
                            (appliedDiscount.value / 100)
                        )
                      : appliedDiscount.value
                  }
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#7a8bbf]">
              <span>Service Charges</span>
              {/* Service charge on discounted fare */}
              <span>₹{Math.round(calculateFare() * 0.05)}</span>
            </div>
            <div className="border-t border-[#3b63f7] my-2"></div>
            <div className="flex justify-between text-white font-semibold">
              <span>Total Amount</span>
              <span>₹{calculateFare() + Math.round(calculateFare() * 0.05)}</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          type="button"
          onClick={handlePayment}
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-3 rounded font-semibold"
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
}

export default BookTickets; 