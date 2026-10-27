import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { name: 'Food packets', unit: 'packets' },
  { name: 'Drinking water', unit: 'Litres' },
  { name: 'Medical kits', unit: 'kits' },
  { name: 'Blankets', unit: 'units' },
  { name: 'Rescue boats', unit: 'boats' },
  { name: 'Ambulances', unit: 'vehicles' },
];

const STATUSES = ['Available', 'In Transit', 'Allocated', 'Low Stock', 'Depleted'];

const LOCATIONS = [
  'State Emergency Relief Hub - Kakkanad',
  'North Sector Staging Base - Angamaly',
  'Ernakulam Govt Medical College Depot',
  'NDRF & Fire Services Water Rescue Post Aluva',
  'Marine Enforcement Base Kochi',
  'Kalamassery Municipal Water Reserve',
  'Aluva Municipal Town Hall Staging Center',
];

export default function ResourceModal({ isOpen, onClose, onSave, resource = null }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food packets',
    quantity: 1000,
    unit: 'packets',
    location: LOCATIONS[0],
    status: 'Available',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        category: resource.category || 'Food packets',
        quantity: resource.quantity || 0,
        unit: resource.unit || 'packets',
        location: resource.location || LOCATIONS[0],
        status: resource.status || 'Available',
      });
    } else {
      setFormData({
        name: '',
        category: 'Food packets',
        quantity: 1000,
        unit: 'packets',
        location: LOCATIONS[0],
        status: 'Available',
      });
    }
    setError('');
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    const found = CATEGORIES.find((c) => c.name === cat);
    setFormData((prev) => ({
      ...prev,
      category: cat,
      unit: found ? found.unit : prev.unit,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Resource name is required');
      return;
    }
    if (formData.quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{resource ? 'Edit Relief Resource' : 'Register New Relief Resource'}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Resource Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. High-Calorie Meal Packs (Ready to Eat)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={handleCategoryChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Available Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Depot / Warehouse Location *</label>
              <select
                className="form-select"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              <span>{resource ? 'Update Inventory' : 'Add to Stock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
