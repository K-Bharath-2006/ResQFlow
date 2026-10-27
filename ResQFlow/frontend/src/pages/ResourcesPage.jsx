import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useDisaster } from '../context/DisasterContext';
import ResourceModal from '../components/ResourceModal';
import SeverityBadge from '../components/SeverityBadge';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Food',
  'Water',
  'Medical Kits',
  'Blankets',
  'Rescue Boats',
  'Ambulances',
];


export default function ResourcesPage({ onNavigate }) {
  const { refreshData } = useDisaster();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await api.getResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenAdd = () => {
    setEditingResource(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await api.deleteResource(id);
      await fetchResources();
      refreshData();
    } catch (err) {
      alert('Failed to delete resource: ' + err.message);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingResource) {
        await api.updateResource(editingResource.id, formData);
      } else {
        await api.createResource(formData);
      }
      setModalOpen(false);
      await fetchResources();
      refreshData();
    } catch (err) {
      alert('Error saving resource: ' + err.message);
    }
  };

  const handleQuickQuantityAdjust = async (res, delta) => {
    const newQty = Math.max(0, res.quantity + delta);
    try {
      await api.updateResource(res.id, { quantity: newQty });
      setResources((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, quantity: newQty } : r))
      );
      refreshData();
    } catch (err) {
      alert('Failed to update quantity: ' + err.message);
    }
  };

  const handleStatusChange = async (res, newStatus) => {
    try {
      await api.updateResource(res.id, { status: newStatus });
      setResources((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, status: newStatus } : r))
      );
      refreshData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesCat =
      selectedCategory === 'All Categories' ||
      r.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(r.category.toLowerCase());
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Relief Resource Management</h1>
          <p className="page-subtitle">
            Catalog, track, and maintain state emergency inventory across all logistics depots
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={15} />
            <span>Add Resource</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('requirements')}>
            <span>Run Requirement Analysis</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.3rem' }}
                placeholder="Search resources, depots, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '180px' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-outline btn-sm" onClick={fetchResources} title="Reload inventory">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Boxes size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>Active Inventory ({filteredResources.length} items)</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time tracking of stockpiles & field assets
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Category</th>
                  <th className="text-right">Available Quantity</th>
                  <th>Depot / Warehouse Location</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No matching relief resources found.
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((res) => (
                    <tr key={res.id}>
                      <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>
                        {res.name}
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-light-blue)', color: 'var(--navy-primary)', fontSize: '0.78rem', fontWeight: 600 }}>
                          {res.category}
                        </span>
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                            onClick={() => handleQuickQuantityAdjust(res, -500)}
                            title="Decrement 500"
                          >
                            <MinusCircle size={15} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: res.quantity === 0 ? 'var(--critical-red)' : 'var(--navy-dark)' }}>
                            {res.quantity.toLocaleString()} {res.unit}
                          </span>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                            onClick={() => handleQuickQuantityAdjust(res, 500)}
                            title="Increment 500"
                          >
                            <PlusCircle size={15} />
                          </button>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {res.location}
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.76rem',
                            width: 'auto',
                            fontWeight: 600,
                            borderColor: res.status === 'Available' ? 'var(--safe-border)' : 'var(--border-subtle)',
                            color: res.status === 'Available' ? 'var(--safe-text)' : 'inherit',
                          }}
                          value={res.status}
                          onChange={(e) => handleStatusChange(res, e.target.value)}
                        >
                          <option value="Available">Available</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Allocated">Allocated</option>
                          <option value="Low Stock">Low Stock</option>
                          <option value="Depleted">Depleted</option>
                        </select>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {res.last_updated}
                      </td>
                      <td className="text-center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.3rem 0.55rem' }}
                            onClick={() => handleOpenEdit(res)}
                            title="Edit Resource"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.3rem 0.55rem' }}
                            onClick={() => handleDelete(res.id, res.name)}
                            title="Delete Resource"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Resource Modal */}
      <ResourceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        resource={editingResource}
      />
    </div>
  );
}
