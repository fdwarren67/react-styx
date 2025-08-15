import { useState } from 'react';

const BlockDetailsPanel = () => {
  const [formData, setFormData] = useState({
    name: '',
    azimuth: ''
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
          <label htmlFor="name" className="form-label">name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '400px' }}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="azimuth" className="form-label">azimuth</label>
          <input
            type="text"
            className="form-control"
            id="azimuth"
            name="azimuth"
            value={formData.azimuth}
            onChange={handleChange}
            style={{ width: '150px' }}
          />
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default BlockDetailsPanel;
