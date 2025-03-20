import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../configs/globalVariables';

function ProfilePage() {
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await axios.get(BASE_URL + '/users/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUserProfile(response.data);
                setName(response.data.name);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };

        const fetchPurchaseHistory = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await axios.get(BASE_URL + '/users/purchase-history', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setPurchaseHistory(response.data);
            } catch (error) {
                console.error('Failed to fetch purchase history:', error);
            }
        };

        fetchUserProfile();
        fetchPurchaseHistory();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        const confirmed = window.confirm('Bạn có chắc thực hiện thay đổi này chứ?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await axios.put(BASE_URL + '/users/profile', { name }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUserProfile(prevProfile => ({ ...prevProfile, name }));
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    if (!userProfile) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
            <div className="mb-4">
                <label className="block text-gray-700">Name:</label>
                {isEditing ? (
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                    />
                ) : (
                    <p className="mt-1 p-2 border border-gray-300 rounded">{userProfile.name}</p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Email:</label>
                <p className="mt-1 p-2 border border-gray-300 rounded">{userProfile.email}</p>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Role:</label>
                <p className="mt-1 p-2 border border-gray-300 rounded">{userProfile.role}</p>
            </div>
            {isEditing ? (
                <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Save
                </button>
            ) : (
                <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Edit
                </button>
            )}

            <h2 className="text-xl font-bold mt-8 mb-4">Purchase History</h2>
            {purchaseHistory.length > 0 ? (
                <ul className="space-y-4">
                    {purchaseHistory.map((purchase) => (
                        <li key={purchase.id} className="p-4 border border-gray-300 rounded">
                            <p><strong>Order ID:</strong> {purchase.id}</p>
                            <p><strong>Date:</strong> {new Date(purchase.date).toLocaleDateString()}</p>
                            <p><strong>Total:</strong> ${purchase.total}</p>
                            {/* Add more purchase details as needed */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No purchase history available.</p>
            )}
        </div>
    );
}

export default ProfilePage;