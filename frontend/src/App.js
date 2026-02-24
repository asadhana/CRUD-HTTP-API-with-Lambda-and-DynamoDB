import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, RefreshCw, LogIn, CheckCircle, XCircle } from 'lucide-react';
import { CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
});

console.log('=== APP INITIALIZATION ===');
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
console.log('API_URL being used:', API_URL);
console.log('Cognito User Pool ID:', process.env.REACT_APP_COGNITO_USER_POOL_ID);
console.log('Cognito Client ID:', process.env.REACT_APP_COGNITO_CLIENT_ID);

function App() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', price: '' });
  const [isUpdate, setIsUpdate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    // Don't auto-fetch on load - require authentication first
    if (API_URL && isAuthenticated && jwtToken) {
      fetchItems();
    }
  }, [isAuthenticated, jwtToken]);

  const handleAuthenticate = async () => {
    setAuthLoading(true);
    console.log('=== AUTHENTICATION DEBUG ===');
    
    const username = process.env.REACT_APP_COGNITO_USERNAME;
    const password = process.env.REACT_APP_COGNITO_PASSWORD;
    
    console.log('Username:', username);
    console.log('User Pool ID:', process.env.REACT_APP_COGNITO_USER_POOL_ID);
    console.log('Client ID:', process.env.REACT_APP_COGNITO_CLIENT_ID);

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        console.log('Authentication successful!');
        console.log('JWT Token:', token);
        setJwtToken(token);
        setIsAuthenticated(true);
        setAuthLoading(false);
        alert('Authentication successful!');
      },
      onFailure: (err) => {
        console.error('Authentication failed:', err);
        setIsAuthenticated(false);
        setAuthLoading(false);
        alert('Authentication failed: ' + err.message);
      },
    });
  };

  const fetchItems = async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated - skipping fetch');
      alert('Please authenticate first to fetch items');
      return;
    }

    console.log('=== FETCH ITEMS DEBUG ===');
    console.log('API_URL:', API_URL);
    console.log('JWT Token:', jwtToken);
    console.log('Fetching from:', `${API_URL}/items`);
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/items`, {
        headers: {
          'Authorization': jwtToken
        }
      });
      console.log('Fetch response:', response);
      console.log('Fetch data:', response.data);
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please authenticate again.');
        setIsAuthenticated(false);
        setJwtToken(null);
      } else {
        alert('Failed to fetch items: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please authenticate first to perform this operation');
      return;
    }

    console.log('=== SUBMIT DEBUG ===');
    console.log('API_URL:', API_URL);
    console.log('JWT Token:', jwtToken);
    console.log('Form Data:', formData);
    
    const payload = {
      id: formData.id,
      name: formData.name,
      price: parseFloat(formData.price)
    };
    console.log('Payload:', payload);
    console.log('Request URL:', `${API_URL}/items`);
    
    try {
      console.log('Sending PUT request...');
      const response = await axios.put(`${API_URL}/items`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken
        }
      });
      console.log('Response:', response);
      setShowModal(false);
      setFormData({ id: '', name: '', price: '' });
      fetchItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('=== ERROR DEBUG ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      console.error('Error message:', error.message);
      console.error('Error config:', error.config);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please authenticate again.');
        setIsAuthenticated(false);
        setJwtToken(null);
      } else {
        alert('Error saving item: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!isAuthenticated) {
      alert('Please authenticate first to perform this operation');
      return;
    }
    if (!window.confirm(`Delete item ${selectedItem.id}?`)) return;

    console.log('=== DELETE DEBUG ===');
    console.log('JWT Token:', jwtToken);
    console.log('Deleting item:', selectedItem.id);
    console.log('Request URL:', `${API_URL}/items/${selectedItem.id}`);

    try {
      console.log('Sending DELETE request...');
      const response = await axios.delete(`${API_URL}/items/${selectedItem.id}`, {
        headers: {
          'Authorization': jwtToken
        }
      });
      console.log('Delete response:', response);
      fetchItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('=== DELETE ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please authenticate again.');
        setIsAuthenticated(false);
        setJwtToken(null);
      } else {
        alert('Error deleting item: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const openAddModal = () => {
    if (!isAuthenticated) {
      alert('Please authenticate first to add items');
      return;
    }
    setIsUpdate(false);
    setFormData({ id: '', name: '', price: '' });
    setShowModal(true);
  };

  const openUpdateModal = () => {
    if (!selectedItem) return;
    if (!isAuthenticated) {
      alert('Please authenticate first to update items');
      return;
    }
    setIsUpdate(true);
    setFormData({
      id: selectedItem.id,
      name: selectedItem.name || '',
      price: selectedItem.price || ''
    });
    setShowModal(true);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">AWS CRUD Dashboard</div>
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="auth-status authenticated">
              <CheckCircle size={20} color="#10b981" />
              <span>Authenticated</span>
            </div>
          ) : (
            <div className="auth-status not-authenticated">
              <XCircle size={20} color="#ef4444" />
              <span>Not Authenticated</span>
            </div>
          )}
          <button 
            className="auth-btn" 
            onClick={handleAuthenticate}
            disabled={authLoading}
          >
            <LogIn size={18} />
            <span>{authLoading ? 'Authenticating...' : 'Authenticate'}</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="action-bar">
          <div className="left-actions">
            <button 
              className="btn btn-primary" 
              onClick={openAddModal}
              disabled={!isAuthenticated}
            >
              <Plus size={18} /> Add Item
            </button>
            <button
              className="btn btn-secondary"
              onClick={openUpdateModal}
              disabled={!selectedItem || !isAuthenticated}
            >
              <Edit2 size={18} /> Update
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={!selectedItem || !isAuthenticated}
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
          <button 
            className="btn btn-icon" 
            onClick={fetchItems} 
            disabled={loading || !isAuthenticated}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>

        <div className="table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedItem?.id === item.id ? 'selected' : ''}
                    onClick={() => handleSelect(item)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItem?.id === item.id}
                        readOnly
                      />
                    </td>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>${item.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state">
                    {loading ? 'Loading...' : isAuthenticated ? 'No items found. Click refresh or add a new item.' : 'Please authenticate to view items.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isUpdate ? 'Update Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="item-id">ID</label>
                <input
                  id="item-id"
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  disabled={isUpdate}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="item-name">Name</label>
                <input
                  id="item-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="item-price">Price</label>
                <input
                  id="item-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
