import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportAPI, wasteAPI } from '../services/api';
import '../styles/ReportWaste.css';

const ReportWaste = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role || '').toLowerCase();
  const [wastes, setWastes] = useState([]);
  const [formData, setFormData] = useState({
    waste_type: '',
    location: '',
    description: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingWastes, setLoadingWastes] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }
    if (role !== 'citizen') {
      navigate('/dashboard');
      return;
    }
    fetchWasteTypes();
  }, [user, navigate, authLoading, role]);

  const fetchWasteTypes = async () => {
    try {
      const response = await wasteAPI.getWastes();
      setWastes(response.data);
    } catch (err) {
      console.error('Error fetching waste types:', err);
      // Fall back to manual entry if API fails
    } finally {
      setLoadingWastes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      setFormData(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to submit a report.');
      navigate('/login');
      return;
    }

    // Validate form
    if (!formData.waste_type || !formData.location || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        waste_type: formData.waste_type,
        location: formData.location,
        description: formData.description,
        status: 'pending',
      };

      if (formData.image) {
        submitData.image = formData.image;
      }

      await reportAPI.createReport(submitData);
      
      setSuccess('Waste report submitted successfully!');
      
      // Reset form
      setFormData({
        waste_type: '',
        location: '',
        description: '',
        image: null,
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting report:', err);
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          setError('Authentication required. Please login again.');
          // Redirect to login after a delay
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setError('You do not have permission to submit reports.');
        } else if (err.response.data) {
          // Try to get error message from response
          const errorData = err.response.data;
          if (typeof errorData === 'string') {
            setError(errorData);
          } else if (errorData.detail) {
            setError(errorData.detail);
          } else if (errorData.message) {
            setError(errorData.message);
          } else {
            setError('Failed to submit report. Please check your input and try again.');
          }
        } else {
          setError(`Server error (${err.response.status}). Please try again.`);
        }
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-waste-container">
      <div className="report-waste-box">
        <h2>Report Waste</h2>
        <p className="subtitle">Help us keep our community clean by reporting waste</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="waste_type">Waste Type *</label>
            <small style={{display: 'block', marginBottom: '8px', color: '#666'}}>
              Select from the dropdown or type manually below
            </small>
            <select
              id="waste_type"
              name="waste_type"
              value={formData.waste_type}
              onChange={handleChange}
            >
              <option value="">Select waste type...</option>
              {loadingWastes ? (
                <option disabled>Loading waste types...</option>
              ) : wastes.length > 0 ? (
                wastes.map(waste => (
                  <option key={waste.id} value={waste.name}>
                    {waste.name}
                  </option>
                ))
              ) : (
                <option disabled>No waste types available - enter manually</option>
              )}
            </select>
            <small>Can't find your type? Use the text field below instead</small>
            <input
              type="text"
              placeholder="Or type waste type here..."
              value={formData.waste_type}
              onChange={(e) => setFormData(prev => ({...prev, waste_type: e.target.value}))}
              style={{marginTop: '8px'}}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., Downtown Street, Park Area"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describe the waste problem in detail..."
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="image">Photo (Optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
            {formData.image && (
              <div className="image-preview">
                <img src={URL.createObjectURL(formData.image)} alt="Preview" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportWaste;

