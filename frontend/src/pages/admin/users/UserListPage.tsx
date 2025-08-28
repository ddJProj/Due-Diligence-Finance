// frontend/src/pages/admin/users/UserListPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/api/user.service';
import { User, UserRole } from '../../../types/auth.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import './UserListPage.css';

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'lastLogin'>('created');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.enabled : !user.enabled
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'lastLogin':
          const aLogin = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const bLogin = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          return bLogin - aLogin;
        default:
          return 0;
      }
    });

    return sorted;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const statistics = useMemo(() => {
    const activeUsers = users.filter(u => u.enabled);
    const admins = users.filter(u => u.role === UserRole.ADMIN);
    const employees = users.filter(u => u.role === UserRole.EMPLOYEE);
    const clients = users.filter(u => u.role === UserRole.CLIENT);

    return {
      total: users.length,
      active: activeUsers.length,
      admins: admins.length,
      employees: employees.length,
      clients: clients.length
    };
  }, [users]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.EMPLOYEE:
        return 'warning';
      case UserRole.CLIENT:
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      setProcessing(true);
      await userService.toggleStatus(user.id);
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, enabled: !u.enabled } : u
      ));
    } catch (err) {
      alert('Failed to toggle user status');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setProcessing(true);
      await userService.delete(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      setProcessing(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Username', 'Email', 'Role', 'Status', 'Created', 'Last Login'];
    const rows = filteredAndSortedUsers.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.username,
      user.email,
      user.role,
      user.enabled ? 'Active' : 'Inactive',
      formatDate(user.createdAt),
      formatDate(user.lastLoginAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="user-list-page">
        <LoadingSpinner message="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-page">
        <ErrorMessage
          title="Error loading users"
          message={error}
          onRetry={fetchUsers}
        />
      </div>
    );
  }

  return (
    <div className="user-list-page">
      <div className="page-header">
        <h1>User Management</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={fetchUsers}>
            Refresh
          </Button>
          <Button variant="secondary" onClick={exportToCSV}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/users/new')}>
            Add User
          </Button>
        </div>
      </div>

      <div className="statistics-cards">
        <Card>
          <div className="stat-card">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{statistics.total}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">{statistics.active}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{statistics.admins}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Employees</span>
            <span className="stat-value">{statistics.employees}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Clients</span>
            <span className="stat-value">{statistics.clients}</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="filter-select"
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.EMPLOYEE}>Employee</option>
            <option value={UserRole.CLIENT}>Client</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="filter-select"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="filter-select"
            aria-label="Sort by"
          >
            <option value="created">Recently Added</option>
            <option value="name">Name (A-Z)</option>
            <option value="lastLogin">Last Login</option>
          </select>
        </div>
      </Card>

      {filteredAndSortedUsers.length === 0 ? (
        <Card>
          <div className="empty-state">
            <h2>No users found</h2>
            <p>No users match your current filters.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">
                      {user.firstName} {user.lastName}
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </td>
                    <td>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={user.enabled ? 'success' : 'secondary'}>
                        {user.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLoginAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={user.enabled ? 'warning' : 'success'}
                          size="small"
                          onClick={() => handleToggleStatus(user)}
                          disabled={processing}
                        >
                          {user.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="error"
                          size="small"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteModalOpen(true);
                          }}
                          disabled={user.role === UserRole.ADMIN}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {deleteModalOpen && userToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          title="Delete User"
        >
          <div className="delete-dialog">
            <p>Are you sure you want to delete this user?</p>
            <div className="user-info">
              <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>
              <span>{userToDelete.email}</span>
            </div>
            <p className="warning-text">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
            <div className="dialog-actions">
              <Button
                variant="error"
                onClick={handleDeleteUser}
                disabled={processing}
              >
                Confirm Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserListPage;
