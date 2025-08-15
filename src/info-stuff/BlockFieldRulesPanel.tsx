import React, { useState } from 'react';

const BlockFieldRulesPanel = () => {
  const [formData, setFormData] = useState({
    parallel: '',
    perpendicular: '',
    wellSpacing: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // You can replace this with your submit logic
  };

  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="parallel" className="form-label">Parallel</label>
          <input
            type="text"
            className="form-control"
            id="parallel"
            name="parallel"
            value={formData.parallel}
            onChange={handleChange}
            style={{ width: '150px' }}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="perpendicular" className="form-label">Perpendicular</label>
          <input
            type="text"
            className="form-control"
            id="perpendicular"
            name="perpendicular"
            value={formData.perpendicular}
            onChange={handleChange}
            style={{ width: '150px' }}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="wellSpacing" className="form-label">Well Spacing</label>
          <input
            type="text"
            className="form-control"
            id="wellSpacing"
            name="wellSpacing"
            value={formData.wellSpacing}
            onChange={handleChange}
            style={{ width: '150px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default BlockFieldRulesPanel;
