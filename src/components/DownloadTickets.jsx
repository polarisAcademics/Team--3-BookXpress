import React, { useState } from 'react';
import axios from 'axios';

export default function TicketForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    id: '',
    event: '',
    date: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/tickets/send-ticket', form);
      alert('Ticket sent successfully!');
    } catch (err) {
      alert('Failed to send ticket.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
      <input name="id" placeholder="Ticket ID" onChange={handleChange} required />
      <input name="event" placeholder="Event Name" onChange={handleChange} required />
      <input name="date" type="date" onChange={handleChange} required />
      <button type="submit">Send Ticket</button>
    </form>
  );
}
