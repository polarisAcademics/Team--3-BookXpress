import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendTicket } from '../services/ticket.service';

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, message } = location.state || {};
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // If no booking data, redirect to home
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

  // Helper function to safely access booking properties
  const safeGet = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  };

  const handleDownloadTicket = () => {
    const ticketContent = `
BookXpress - Train Ticket
========================

PNR: ${safeGet(booking, 'pnrNumber')}
Booking ID: ${safeGet(booking, '_id')}

Train Details:
- Train: ${safeGet(booking, 'trainDetails.name')} (${safeGet(booking, 'trainDetails.number')})
- From: ${safeGet(booking, 'trainDetails.fromStation')}
- To: ${safeGet(booking, 'trainDetails.toStation')}
- Class: ${safeGet(booking, 'trainDetails.selectedClass')}
- Date: ${safeGet(booking, 'trainDetails.journeyDate', new Date().toISOString().split('T')[0])}

Passengers:
${(booking.passengers || []).map((p, i) => `${i + 1}. ${safeGet(p, 'name')} (${safeGet(p, 'age')}yr, ${safeGet(p, 'gender')})`).join('\n')}

Payment Details:
- Total Amount: ₹${safeGet(booking, 'totalFare')}
- Payment ID: ${safeGet(booking, 'paymentDetails.transactionId')}
- Status: ${safeGet(booking, 'status')}
- Booking Date: ${new Date(safeGet(booking, 'createdAt', new Date())).toLocaleDateString()}

Thank you for choosing BookXpress!
`;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BookXpress_Ticket_${safeGet(booking, 'pnrNumber', 'UNKNOWN')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleEmailPdfTicket = async () => {
    setSending(true);
    const ticketDetails = {
      PNR: safeGet(booking, 'pnrNumber'),
      'Booking ID': safeGet(booking, '_id'),
      'Train': `${safeGet(booking, 'trainDetails.name')} (${safeGet(booking, 'trainDetails.number')})`,
      'From': safeGet(booking, 'trainDetails.fromStation'),
      'To': safeGet(booking, 'trainDetails.toStation'),
      'Class': safeGet(booking, 'trainDetails.selectedClass'),
      'Date': safeGet(booking, 'trainDetails.journeyDate', new Date().toISOString().split('T')[0]),
      'Passengers': (booking.passengers || []).map((p, i) => `${i + 1}. ${safeGet(p, 'name')} (${safeGet(p, 'age')}yr, ${safeGet(p, 'gender')})`).join('; '),
      'Total Amount': `₹${safeGet(booking, 'totalFare')}`,
      'Payment ID': safeGet(booking, 'paymentDetails.transactionId'),
      'Status': safeGet(booking, 'status'),
      'Booking Date': new Date(safeGet(booking, 'createdAt', new Date())).toLocaleDateString(),
    };
    try {
      // For now, just show an alert since we don't have email implementation
      alert('Email feature not implemented yet. Please download the ticket instead.');
    } catch (err) {
      alert('Failed to send ticket to email. Please try again.');
    } finally {
      setSending(false);
    }
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
                <span className="text-white font-mono font-bold">{safeGet(booking, 'pnrNumber')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Booking ID:</span>
                <span className="text-white font-mono">{safeGet(booking, '_id')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Status:</span>
                <span className="text-green-400 font-semibold">{safeGet(booking, 'status')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Booking Date:</span>
                <span className="text-white">{new Date(safeGet(booking, 'createdAt', new Date())).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Info */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Payment Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Total Amount:</span>
                <span className="text-white font-bold">₹{safeGet(booking, 'totalFare')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Payment ID:</span>
                <span className="text-white font-mono text-sm">{safeGet(booking, 'paymentDetails.transactionId')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a8bbf]">Payment Status:</span>
                <span className="text-green-400 font-semibold capitalize">{safeGet(booking, 'paymentDetails.status')}</span>
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
            <h3 className="text-lg font-medium text-white">{safeGet(booking, 'trainDetails.name')}</h3>
            <p className="text-[#7a8bbf]">Train Number: {safeGet(booking, 'trainDetails.number')}</p>
            <p className="text-[#7a8bbf]">Class: {safeGet(booking, 'trainDetails.selectedClass')}</p>
          </div>
          <div>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Route:</span> {safeGet(booking, 'trainDetails.fromStation')} → {safeGet(booking, 'trainDetails.toStation')}
            </p>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Travel Date:</span> {new Date(safeGet(booking, 'trainDetails.journeyDate', new Date())).toLocaleDateString()}
            </p>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Departure:</span> {safeGet(booking, 'trainDetails.departureTime')}
            </p>
            <p className="text-white">
              <span className="text-[#7a8bbf]">Arrival:</span> {safeGet(booking, 'trainDetails.arrivalTime')}
            </p>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="bg-[#2a3147] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Passenger Details</h2>
        <div className="space-y-3">
          {(booking.passengers || []).map((passenger, index) => (
            <div key={index} className="bg-[#1e2535] p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[#7a8bbf] text-sm">Name</span>
                  <p className="text-white font-medium">{safeGet(passenger, 'name')}</p>
                </div>
                <div>
                  <span className="text-[#7a8bbf] text-sm">Age</span>
                  <p className="text-white">{safeGet(passenger, 'age')} years</p>
                </div>
                <div>
                  <span className="text-[#7a8bbf] text-sm">Gender</span>
                  <p className="text-white capitalize">{safeGet(passenger, 'gender')}</p>
                </div>
              </div>
            </div>
          ))}
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
          onClick={handleEmailPdfTicket}
          className="flex-1 bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-3 px-6 rounded font-semibold transition-colors"
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Email PDF Ticket'}
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