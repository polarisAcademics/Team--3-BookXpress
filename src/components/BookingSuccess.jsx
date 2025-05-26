import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, message } = location.state || {};

  useEffect(() => {
    // If no booking data, redirect to home
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

  const handleDownloadTicket = () => {
    // Create a simple text-based ticket
    const ticketContent = `
BookXpress - Train Ticket
========================

PNR: ${booking.pnr}
Booking ID: ${booking.id}

Train Details:
- Train: ${booking.train.name} (${booking.train.id})
- From: ${booking.train.from}
- To: ${booking.train.to}
- Class: ${booking.selectedClass}
- Date: ${booking.travelDate}

Passengers:
${booking.passengers.map((p, i) => `${i + 1}. ${p.name} (${p.age}yr, ${p.gender}) - ${p.berthPreference} berth`).join('\n')}

Contact Details:
- Name: ${booking.contact.name}
- Email: ${booking.contact.email}
- Phone: ${booking.contact.phone}
- Address: ${booking.contact.address}

Payment Details:
- Total Amount: ₹${booking.totalAmount}
- Payment ID: ${booking.paymentDetails.razorpay_payment_id}
- Status: ${booking.status}
- Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}

Thank you for choosing BookXpress!
`;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BookXpress_Ticket_${booking.pnr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-[#7a8bbf] text-lg">{message}</p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-[#1e2535] rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Booking Info */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Booking Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">PNR Number:</span>
                <span className="text-white font-mono font-bold">{booking.pnr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Booking ID:</span>
                <span className="text-white font-mono">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Status:</span>
                <span className="text-green-400 font-semibold">{booking.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Booking Date:</span>
                <span className="text-white">{new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Info */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Payment Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Total Amount:</span>
                <span className="text-white font-bold">₹{booking.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Payment ID:</span>
                <span className="text-white font-mono text-sm">{booking.paymentDetails.razorpay_payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Payment Status:</span>
                <span className="text-green-400 font-semibold capitalize">{booking.paymentDetails.payment_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Train Details */}
      <div className="bg-[#2a3147] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Train Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-white">{booking.train.name}</h3>
            <p className="text-[#7a8bbf]">Train Number: {booking.train.id}</p>
            <p className="text-[#7a8bbf]">Class: {booking.selectedClass}</p>
          </div>
          <div>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Route:</span> {booking.train.from} → {booking.train.to}
            </p>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Travel Date:</span> {booking.travelDate}
            </p>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="bg-[#2a3147] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Passenger Details</h2>
        <div className="space-y-3">
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="bg-[#1e2535] p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[#7a8bbf] text-sm">Name</span>
                  <p className="text-white font-medium">{passenger.name}</p>
                </div>
                <div>
                  <span className="text-[#7a8bbf] text-sm">Age</span>
                  <p className="text-white">{passenger.age} years</p>
                </div>
                <div>
                  <span className="text-[#7a8bbf] text-sm">Gender</span>
                  <p className="text-white capitalize">{passenger.gender}</p>
                </div>
                <div>
                  <span className="text-[#7a8bbf] text-sm">Berth Preference</span>
                  <p className="text-white capitalize">{passenger.berthPreference}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-[#2a3147] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Name:</span> {booking.contact.name}
            </p>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Email:</span> {booking.contact.email}
            </p>
          </div>
          <div>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Phone:</span> {booking.contact.phone}
            </p>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Address:</span> {booking.contact.address}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={handleDownloadTicket}
          className="flex-1 bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-3 px-6 rounded font-semibold transition-colors"
        >
          Download Ticket
        </button>
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex-1 bg-[#2a3147] hover:bg-[#3a4457] text-white py-3 px-6 rounded font-semibold transition-colors"
        >
          View All Bookings
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 bg-[#2a3147] hover:bg-[#3a4457] text-white py-3 px-6 rounded font-semibold transition-colors"
        >
          Book Another Ticket
        </button>
      </div>

      {/* Important Information */}
      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">Important Information</h3>
        <ul className="text-yellow-200 text-sm space-y-1">
          <li>• Please carry a valid ID proof during your journey</li>
          <li>• Report at the station at least 30 minutes before departure</li>
          <li>• Keep your PNR number safe for future reference</li>
          <li>• You can check your PNR status anytime on our platform</li>
          <li>• For cancellations, contact our support team</li>
        </ul>
      </div>
    </div>
  );
}

export default BookingSuccess; 