import React, { useState, useEffect } from 'react';

const initialProfile = {
  fullName: '',
  photo: '',
  gender: '',
  dob: '',
  nationality: '',
  language: '',
  email: '',
  mobile: '',
  address: '',
};

function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(initialProfile);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    // Fetch profile from backend
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data.profile || initialProfile);
        setPhotoPreview(data.profile?.photo || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch ticket history
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch('/api/bookings/history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch ticket history');
        const data = await res.json();
        setHistory(data.bookings || []);
      } catch (err) {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      setProfile((prev) => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to save profile');
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    if (passwords.new !== passwords.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      if (!res.ok) throw new Error('Failed to change password');
      setPwSuccess('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPwError('Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-theme-secondary rounded-lg shadow-xl p-8 mt-8">
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-t font-semibold focus:outline-none transition-colors duration-200 ${activeTab === 'profile' ? 'bg-[var(--accent-color)] text-white' : 'bg-theme-primary text-theme-primary hover:bg-[var(--accent-color)] hover:text-white'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Info
        </button>
        <button
          className={`px-4 py-2 rounded-t font-semibold focus:outline-none transition-colors duration-200 ${activeTab === 'settings' ? 'bg-[var(--accent-color)] text-white' : 'bg-theme-primary text-theme-primary hover:bg-[var(--accent-color)] hover:text-white'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-theme-secondary mb-1">Full name (as per ID)</label>
                <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Profile photo</label>
                <input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-full" />
                {photoPreview && <img src={photoPreview} alt="Profile preview" className="mt-2 h-16 w-16 rounded-full object-cover" />}
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Gender</label>
                <select name="gender" value={profile.gender} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Date of birth</label>
                <input type="date" name="dob" value={profile.dob} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Nationality</label>
                <input type="text" name="nationality" value={profile.nationality} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Preferred language</label>
                <input type="text" name="language" value={profile.language} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-theme-secondary mb-1">Email address</label>
                <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Mobile number</label>
                <input type="tel" name="mobile" value={profile.mobile} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-theme-secondary mb-1">Address</label>
                <input type="text" name="address" value={profile.address} onChange={handleChange} className="w-full bg-theme-primary text-theme-primary rounded px-3 py-2" />
              </div>
            </div>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}
          <button type="submit" className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-6 py-2 rounded font-semibold" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
      {activeTab === 'settings' && (
        <div>
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} placeholder="Current password" className="bg-theme-primary text-theme-primary rounded px-3 py-2" required />
              <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} placeholder="New password" className="bg-theme-primary text-theme-primary rounded px-3 py-2" required />
              <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} placeholder="Confirm new password" className="bg-theme-primary text-theme-primary rounded px-3 py-2" required />
              <button type="submit" className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-6 py-2 rounded font-semibold md:col-span-3 mt-2">Change Password</button>
            </form>
            {pwError && <div className="text-red-500 mb-2">{pwError}</div>}
            {pwSuccess && <div className="text-green-500 mb-2">{pwSuccess}</div>}
          </div>
          <div className="text-theme-secondary">More settings coming soon...</div>
        </div>
      )}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-theme-primary mb-2">Ticket History</h3>
        {historyLoading ? (
          <div className="text-theme-secondary">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-theme-secondary">No ticket history found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-theme-primary rounded">
              <thead>
                <tr className="bg-theme-secondary">
                  <th className="px-4 py-2 text-left">Train</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">PNR</th>
                </tr>
              </thead>
              <tbody>
                {history.map((b, i) => (
                  <tr key={i} className="border-b border-theme-secondary">
                    <td className="px-4 py-2">{b.trainName}</td>
                    <td className="px-4 py-2">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{b.status}</td>
                    <td className="px-4 py-2">{b.pnr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile; 