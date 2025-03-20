import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../configs/globalVariables';

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await axios.put(
        BASE_URL + '/change-password',
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Password changed successfully');
      setError('');
    } catch (error) {
      setError('Failed to change password');
      setSuccess('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleChangePassword}>
        <div className="mb-4">
          <label className="block text-gray-700">Current Password:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm New Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}

export default ChangePasswordPage;