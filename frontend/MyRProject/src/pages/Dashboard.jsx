import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportAPI, userAPI, wasteAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [wasteForm, setWasteForm] = useState({ name: '', description: '' });
  const [savingWasteType, setSavingWasteType] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    fetchReports();
    if (role === 'admin') {
      fetchUsers();
      fetchWasteTypes();
    }
  }, [user, role]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportAPI.getReports();
      const payload = response.data;
      const reportList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];
      setReports(reportList);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        `Failed to load reports (${err?.response?.status || 'network error'})`;
      setError(apiMessage);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getProfiles();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchWasteTypes = async () => {
    try {
      const response = await wasteAPI.getWastes();
      const payload = response.data;
      const wasteList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];
      setWasteTypes(wasteList);
    } catch (err) {
      console.error('Error fetching waste types:', err);
    }
  };

  const handleWasteTypeInput = (e) => {
    const { name, value } = e.target;
    setWasteForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateWasteType = async (e) => {
    e.preventDefault();
    const name = wasteForm.name.trim();
    const description = wasteForm.description.trim();
    if (!name || !description) {
      setError('Waste type name and description are required.');
      return;
    }

    try {
      setSavingWasteType(true);
      setError('');
      const response = await wasteAPI.createWaste({ name, description });
      const created = response.data;
      setWasteTypes(prev => [created, ...prev]);
      setWasteForm({ name: '', description: '' });
    } catch (err) {
      const apiMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        `Failed to create waste type (${err?.response?.status || 'network error'})`;
      setError(apiMessage);
      console.error('Error creating waste type:', err);
    } finally {
      setSavingWasteType(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await reportAPI.updateReport(reportId, { status: newStatus });
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
    } catch (err) {
      const apiMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        `Failed to update report status (${err?.response?.status || 'network error'})`;
      setError(apiMessage);
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportAPI.deleteReport(reportId);
        setReports(reports.filter(report => report.id !== reportId));
      } catch (err) {
        setError('Failed to delete report');
        console.error('Error deleting report:', err);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteProfile(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleDeleteWasteType = async (wasteId) => {
    if (window.confirm('Are you sure you want to delete this waste type?')) {
      try {
        await wasteAPI.deleteWaste(wasteId);
        setWasteTypes(wasteTypes.filter(w => w.id !== wasteId));
      } catch (err) {
        setError('Failed to delete waste type');
        console.error('Error deleting waste type:', err);
      }
    }
  };

  // Filter reports based on user role
  const displayReports = (role === 'officer' || role === 'admin')
    ? reports 
    : reports.filter(report => report.user === user?.id);

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const renderReportsTable = () => (
    loading ? (
      <div className="loading">Loading reports...</div>
    ) : displayReports.length === 0 ? (
      <div className="empty-state">
        <p>No reports found</p>
        {role === 'citizen' && (
          <p>Start by creating a new waste report</p>
        )}
      </div>
    ) : (
      <div className="reports-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Waste Type</th>
              <th>Location</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
              {(role === 'officer' || role === 'admin') && <th>Reported By</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayReports.map(report => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td>{report.waste_type}</td>
                <td>{report.location}</td>
                <td className="description">{report.description || '-'}</td>
                <td>
                  {(role === 'officer' || role === 'admin') ? (
                    <select 
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">On Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  ) : (
                    <span className={getStatusBadgeClass(report.status)}>
                      {report.status}
                    </span>
                  )}
                </td>
                <td>{new Date(report.time_created).toLocaleDateString()}</td>
                {(role === 'officer' || role === 'admin') && (
                  <td>{report.user_details?.username || (report.user ? `User ${report.user}` : 'Unknown user')}</td>
                )}
                <td className="actions">
                  {report.image && (
                    <a href={report.image} target="_blank" rel="noopener noreferrer" className="btn-small">
                      View Image
                    </a>
                  )}
                  {role === 'admin' && (
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  const renderUsersTable = () => (
    <div className="users-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.user?.username || user.username}</td>
              <td>{user.user?.email || user.email}</td>
              <td>{user.role}</td>
              <td>{user.phone_number}</td>
              <td className="actions">
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderWasteTypesTable = () => (
    <div className="waste-table">
      <form className="waste-type-form" onSubmit={handleCreateWasteType}>
        <h3>Add Waste Type</h3>
        <div className="waste-type-form-grid">
          <input
            type="text"
            name="name"
            value={wasteForm.name}
            onChange={handleWasteTypeInput}
            placeholder="Waste type name (e.g. Plastic)"
            required
          />
          <textarea
            name="description"
            value={wasteForm.description}
            onChange={handleWasteTypeInput}
            placeholder="Short description for this waste category"
            rows="2"
            required
          />
        </div>
        <button type="submit" className="btn-small btn-add" disabled={savingWasteType}>
          {savingWasteType ? 'Saving...' : 'Add Waste Type'}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {wasteTypes.map(waste => (
            <tr key={waste.id}>
              <td>{waste.id}</td>
              <td>{waste.name}</td>
              <td>{waste.description}</td>
              <td className="actions">
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteWasteType(waste.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.username}!</span>
          <span className="role-badge">{user?.role}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        {role === 'admin' && (
          <div className="admin-tabs">
            <button 
              className={activeTab === 'reports' ? 'active' : ''} 
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
            <button 
              className={activeTab === 'users' ? 'active' : ''} 
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button 
              className={activeTab === 'waste' ? 'active' : ''} 
              onClick={() => setActiveTab('waste')}
            >
              Waste Types
            </button>
          </div>
        )}

        {activeTab === 'reports' && (
          <>
            <h2>Waste Reports</h2>
            {renderReportsTable()}
          </>
        )}

        {role === 'admin' && activeTab === 'users' && (
          <>
            <h2>Users Management</h2>
            {renderUsersTable()}
          </>
        )}

        {role === 'admin' && activeTab === 'waste' && (
          <>
            <h2>Waste Types Management</h2>
            {renderWasteTypesTable()}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
