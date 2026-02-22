import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, RefreshCw, LogIn } from 'lucide-react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function App() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', price: '' });
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (API_URL) {
      fetchItems();
    }
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to fetch items. Check API URL and CORS.');
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
    try {
      await axios.put(`${API_URL}/items`, {
        id: formData.id,
        name: formData.name,
        price: parseFloat(formData.price)
      });
      setShowModal(false);
      setFormData({ id: '', name: '', price: '' });
      fetchItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!window.confirm(`Delete item ${selectedItem.id}?`)) return;

    try {
      await axios.delete(`${API_URL}/items/${selectedItem.id}`);
      fetchItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const openAddModal = () => {
    setIsUpdate(false);
    setFormData({ id: '', name: '', price: '' });
    setShowModal(true);
  };

  const openUpdateModal = () => {
    if (!selectedItem) return;
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
        <button className="auth-btn" onClick={() => alert('Authentication implementation coming soon!')}>
          <LogIn size={18} />
          <span>Authenticate</span>
        </button>
      </nav>

      <main className="main-content">
        <div className="action-bar">
          <div className="left-actions">
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add Item
            </button>
            <button
              className="btn btn-secondary"
              onClick={openUpdateModal}
              disabled={!selectedItem}
            >
              <Edit2 size={18} /> Update
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={!selectedItem}
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
          <button className="btn btn-icon" onClick={fetchItems} disabled={loading}>
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
                    {loading ? 'Loading...' : 'No items found. Click refresh or add a new item.'}
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
