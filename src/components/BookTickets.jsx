import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment } from '../services/paymentService';

// Add API base URL constant
const API_BASE_URL = 'https://bookxpress.onrender.com';

function BookTickets() {
  const location = useLocation();
  const navigate = useNavigate();
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

  const [savedTravelers, setSavedTravelers] = useState([]);
  const [showSaveTravelerModal, setShowSaveTravelerModal] = useState(false);
  const [selectedTravelerIndex, setSelectedTravelerIndex] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Fetch saved travelers when component mounts
  useEffect(() => {
    const fetchSavedTravelers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, skipping traveler fetch');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/travelers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSavedTravelers(data);
      } catch (error) {
        console.error('Failed to fetch saved travelers:', error);
        // Don't show alert for 401 (unauthorized) as it's expected when not logged in
        if (error.message && !error.message.includes('401')) {
          alert('Failed to load saved travelers. Please try again later.');
        }
      }
    };

    fetchSavedTravelers();
  }, []);

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

  const saveTraveler = async (passenger) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save travelers');
        return;
      }

      console.log('Token from localStorage:', token);

      const response = await fetch(`${API_BASE_URL}/api/travelers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passenger)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        
        if (errorData.error === 'Token expired') {
          localStorage.removeItem('token');
          alert('Your session has expired. Please login again.');
          // You might want to redirect to login page here
          return;
        }
        
        throw new Error(errorData.details || errorData.error || 'Failed to save traveler');
      }

      const savedTraveler = await response.json();
      setSavedTravelers(prev => [...prev, savedTraveler]);
      alert('Traveler saved successfully!');
    } catch (error) {
      console.error('Error saving traveler:', error);
      if (error.message.includes('Invalid token') || error.message.includes('Token expired')) {
        localStorage.removeItem('token');
        alert('Your session has expired. Please login again.');
        // You might want to redirect to login page here
      } else {
        alert(error.message || 'Failed to save traveler. Please try again later.');
      }
    }
  };

  const useSavedTraveler = (traveler) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[selectedTravelerIndex] = {
      name: traveler.name,
      age: traveler.age,
      gender: traveler.gender,
      berthPreference: traveler.berthPreference
    };
    setFormData(prev => ({
      ...prev,
      passengers: updatedPassengers
    }));
    setShowSaveTravelerModal(false);
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

  const handlePayment = async () => {
    // Validate form data
    const isFormValid = validateForm();
    if (!isFormValid) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const totalAmount = calculateFare() + Math.round(calculateFare() * 0.05); // Including service charges
      
      const bookingData = {
        train: selectedTrain,
        selectedClass: selectedClass,
        passengers: formData.passengers,
        contact: formData.contact,
        totalAmount: totalAmount,
        appliedDiscount: appliedDiscount,
        travelDate: selectedTrain.date || new Date().toISOString().split('T')[0],
      };

      console.log('Processing payment for booking:', bookingData);
      
      // Process payment using Razorpay
      const booking = await processPayment(bookingData);
      
      // Payment successful, redirect to booking confirmation
      navigate('/booking-success', { 
        state: { 
          booking,
          message: 'Payment successful! Your ticket has been confirmed.' 
        } 
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const validateForm = () => {
    // Validate passengers
    for (const passenger of formData.passengers) {
      if (!passenger.name || !passenger.age || passenger.age < 1 || passenger.age > 120) {
        return false;
      }
    }
    
    // Validate contact information
    const { name, email, phone, address } = formData.contact;
    if (!name || !email || !phone || !address) {
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Basic phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return false;
    }
    
    return true;
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
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTravelerIndex(index);
                      setShowSaveTravelerModal(true);
                    }}
                    className="text-[#3b63f7] hover:text-[#2f54e0]"
                  >
                    Save
                  </button>
                  {savedTravelers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTravelerIndex(index);
                        setShowSaveTravelerModal(true);
                      }}
                      className="text-[#3b63f7] hover:text-[#2f54e0]"
                    >
                      Use Saved
                    </button>
                  )}
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

        {/* Payment Error Display */}
        {paymentError && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-300">{paymentError}</p>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          type="button"
          onClick={handlePayment}
          disabled={isProcessingPayment}
          className={`w-full py-3 rounded font-semibold transition-colors ${
            isProcessingPayment
              ? 'bg-gray-600 cursor-not-allowed text-gray-300'
              : 'bg-[#3b63f7] hover:bg-[#2f54e0] text-white'
          }`}
        >
          {isProcessingPayment ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            'Proceed to Payment'
          )}
        </button>
      </form>

      {/* Save Traveler Modal */}
      {showSaveTravelerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#1e2535] p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">Manage Traveler</h3>
            <div className="space-y-4">
              <button
                onClick={() => saveTraveler(formData.passengers[selectedTravelerIndex])}
                className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-2 rounded"
              >
                Save New Traveler
              </button>
              {savedTravelers.length > 0 && (
                <>
                  <div className="text-[#7a8bbf] text-sm">Or use saved traveler:</div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {savedTravelers.map((traveler) => (
                      <button
                        key={traveler._id}
                        onClick={() => useSavedTraveler(traveler)}
                        className="w-full bg-[#2a3147] hover:bg-[#3b63f7] text-white py-2 rounded flex justify-between items-center px-4"
                      >
                        <span>{traveler.name} ({traveler.age} years)</span>
                        {traveler.isDefault && (
                          <span className="bg-[#3b63f7] text-white text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={() => setShowSaveTravelerModal(false)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookTickets; 