// frontend/src/pages/employee/clients/ClientListPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/api/user.service';
import { User } from '../../../types/auth.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import './ClientListPage.css';

interface ClientWithPortfolio extends User {
  portfolioValue?: number;
  totalInvestments?: number;
}

const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientWithPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'portfolio-desc' | 'portfolio-asc' | 'recent'>('name');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getClientsList();
      setClients(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => 
        statusFilter === 'active' ? client.enabled : !client.enabled
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'portfolio-desc':
          return (b.portfolioValue || 0) - (a.portfolioValue || 0);
        case 'portfolio-asc':
          return (a.portfolioValue || 0) - (b.portfolioValue || 0);
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [clients, searchTerm, statusFilter, sortBy]);

  const statistics = useMemo(() => {
    const activeClients = clients.filter(c => c.enabled);
    const totalAUM = clients.reduce((sum, c) => sum + (c.portfolioValue || 0), 0);
    const avgPortfolio = clients.length > 0 ? totalAUM / clients.length : 0;

    return {
      total: clients.length,
      active: activeClients.length,
      totalAUM,
      avgPortfolio
    };
  }, [clients]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Status', 'Portfolio Value', 'Investments', 'Last Login', 'Member Since'];
    const rows = filteredAndSortedClients.map(client => [
      `${client.firstName} ${client.lastName}`,
      client.email,
      client.enabled ? 'Active' : 'Inactive',
      client.portfolioValue || 0,
      client.totalInvestments || 0,
      formatDate(client.lastLoginAt),
      formatDate(client.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="client-list-page">
        <LoadingSpinner message="Loading clients..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-list-page">
        <ErrorMessage
          title="Error loading clients"
          message={error}
          onRetry={fetchClients}
        />
      </div>
    );
  }

  return (
    <div className="client-list-page">
      <div className="page-header">
        <h1>Client Management</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={fetchClients}>
            Refresh
          </Button>
          <Button variant="secondary" onClick={exportToCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="statistics-cards">
        <Card>
          <div className="stat-card">
            <span className="stat-label">Total Clients</span>
            <span className="stat-value">{statistics.total}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Active Clients</span>
            <span className="stat-value">{statistics.active}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Total AUM</span>
            <span className="stat-value">{formatCurrency(statistics.totalAUM)}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Average Portfolio</span>
            <span className="stat-value">{formatCurrency(statistics.avgPortfolio)}</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
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
            <option value="name">Name (A-Z)</option>
            <option value="portfolio-desc">Portfolio (High to Low)</option>
            <option value="portfolio-asc">Portfolio (Low to High)</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </Card>

      {filteredAndSortedClients.length === 0 ? (
        <Card>
          <div className="empty-state">
            <h2>No clients found</h2>
            <p>No clients match your current filters. Try adjusting your search criteria.</p>
          </div>
        </Card>
      ) : isMobile ? (
        <div className="client-cards">
          {filteredAndSortedClients.map((client) => (
            <Card key={client.id} data-testid="client-card">
              <div className="client-card">
                <div className="client-card-header">
                  <h3>{client.firstName} {client.lastName}</h3>
                  <Badge variant={client.enabled ? 'success' : 'secondary'}>
                    {client.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="client-card-details">
                  <div className="detail-row">
                    <span>Email:</span>
                    <a href={`mailto:${client.email}`}>{client.email}</a>
                  </div>
                  <div className="detail-row">
                    <span>Portfolio:</span>
                    <span className="portfolio-value">
                      {formatCurrency(client.portfolioValue || 0)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Investments:</span>
                    <span>{client.totalInvestments || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span>Last Login:</span>
                    <span>{formatDate(client.lastLoginAt)}</span>
                  </div>
                </div>

                <div className="client-card-actions">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate(`/employee/clients/${client.id}`)}
                    fullWidth
                  >
                    View Portfolio
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="client-table-container">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Portfolio Value</th>
                  <th>Investments</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.map((client) => (
                  <tr key={client.id}>
                    <td className="client-name">
                      {client.firstName} {client.lastName}
                    </td>
                    <td>
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    </td>
                    <td>
                      <Badge variant={client.enabled ? 'success' : 'secondary'}>
                        {client.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="portfolio-value">
                      {formatCurrency(client.portfolioValue || 0)}
                    </td>
                    <td>{client.totalInvestments || 0}</td>
                    <td>{formatDate(client.lastLoginAt)}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate(`/employee/clients/${client.id}`)}
                      >
                        View Portfolio
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClientListPage;
