import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'cashier'
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data.users);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreateUser = () => {
    setModalMode('create');
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'cashier'
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await api.post('/users', formData);
      } else {
        await api.put(`/users/${selectedUser.id}`, {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        });
      }
      
      setShowModal(false);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await api.put(`/users/${userId}`, { isActive: false });
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      await api.post(`/users/${userId}/reset-password`, { newPassword });
      alert('Password reset successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'status-chip danger',
      manager: 'status-chip',
      cashier: 'status-chip ok'
    };
    return classes[role] || 'status-chip';
  };

  return (
    <div className="content">
      <div className="stack">
        <div className="page-head">
          <div>
            <h1>User Management</h1>
            <p className="muted-text">Manage system users and permissions</p>
          </div>
          <button className="primary-btn" onClick={handleCreateUser}>
            + Create User
          </button>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-title">Total Users</p>
              <h2>{stats.total_users}</h2>
            </div>
            <div className="stat-card success">
              <p className="stat-title">Active Users</p>
              <h2>{stats.active_users}</h2>
            </div>
            <div className="stat-card">
              <p className="stat-title">Admins</p>
              <h2>{stats.admin_count}</h2>
            </div>
            <div className="stat-card">
              <p className="stat-title">Managers</p>
              <h2>{stats.manager_count}</h2>
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            <h3>All Users</h3>
          </div>

          <div className="grid two" style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email || '-'}</td>
                        <td>
                          <span className={getRoleBadgeClass(user.role)}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={user.isActive ? 'status-chip ok' : 'status-chip danger'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="actions-row">
                            <button
                              className="ghost-btn mini"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </button>
                            <button
                              className="ghost-btn mini"
                              onClick={() => handleResetPassword(user.id)}
                            >
                              Reset Password
                            </button>
                            {user.isActive && (
                              <button
                                className="danger-btn mini"
                                onClick={() => handleDeactivate(user.id)}
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Create New User' : 'Edit User'}</h3>
              <button onClick={() => setShowModal(false)} className="ghost-btn">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="stack">
                <label>
                  Username *
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </label>

                {modalMode === 'create' && (
                  <label>
                    Password *
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <small className="muted-text">Minimum 6 characters</small>
                  </label>
                )}

                <label>
                  Role *
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                {modalMode === 'edit' && (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                )}

                <div className="grid two">
                  <button type="button" className="ghost-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {modalMode === 'create' ? 'Create User' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
