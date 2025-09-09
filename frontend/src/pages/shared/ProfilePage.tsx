// frontend/src/pages/shared/ProfilePage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectUser } from '@/store/slices/authSlice';
import { adminService } from '@/api/AdminService';
import { clientService } from '@/api/ClientService';
import { employeeService } from '@/api/EmployeeService';
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Badge,
  Card,
} from '@/components/common';
import './ProfilePage.css';

interface ProfileData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  employeeId?: string;
  dateOfBirth?: string;
  joinDate: string;
  lastActive: string;
  isActive: boolean;
  // Client specific
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  portfolioValue?: number;
  totalInvestments?: number;
  // Employee specific
  totalClients?: number;
  totalAUM?: number;
  // Admin specific
  systemRole?: string;
  lastLogin?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let data: any;
      switch (currentUser.role) {
        case 'CLIENT':
          data = await clientService.getProfile();
          break;
        case 'EMPLOYEE':
          data = await employeeService.getProfile();
          break;
        case 'ADMIN':
          data = await adminService.getUserProfile(currentUser.id);
          break;
        default:
          setError('Profile not available for guest users');
          setLoading(false);
          return;
      }
      
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string, includeTime = false) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    if (includeTime) {
      options.hour = 'numeric';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <LoadingSpinner size="large" message="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    // Guest users
    if (currentUser?.role === 'GUEST') {
      return (
        <div className="profile-page">
          <div className="guest-message">
            <h2>Guest Account</h2>
            <p>Please log in to view your profile.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-page">
        <ErrorMessage
          message="Failed to load profile"
          details={error || 'Profile not found'}
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-title">
          <h1>My Profile</h1>
          <Badge
            variant={profile.isActive ? 'success' : 'danger'}
            size="large"
          >
            {profile.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="profile-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/settings')}
          >
            Settings
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <Card className="profile-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <span>{`${profile.firstName} ${profile.lastName}`}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{profile.email}</span>
            </div>
            <div className="info-item">
              <label>Role</label>
              <Badge variant="secondary">{profile.role}</Badge>
            </div>
            {profile.phoneNumber && (
              <div className="info-item">
                <label>Phone</label>
                <span>{profile.phoneNumber}</span>
              </div>
            )}
            {profile.address && (
              <div className="info-item full-width">
                <label>Address</label>
                <span>{profile.address}</span>
              </div>
            )}
            {profile.dateOfBirth && (
              <div className="info-item">
                <label>Date of Birth</label>
                <span>{formatDate(profile.dateOfBirth)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Role-specific Information */}
        {currentUser?.role === 'CLIENT' && (
          <>
            <Card className="profile-section">
              <h2>Portfolio Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Portfolio Value</label>
                  <span className="value-large">
                    {formatCurrency(profile.portfolioValue || 0)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Total Investments</label>
                  <span className="value-large">
                    {profile.totalInvestments || 0}
                  </span>
                </div>
                {profile.assignedEmployeeName && (
                  <div className="info-item">
                    <label>Assigned Advisor</label>
                    <span>{profile.assignedEmployeeName}</span>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {currentUser?.role === 'EMPLOYEE' && (
          <>
            <Card className="profile-section">
              <h2>Employment Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Employee ID</label>
                  <span>{profile.employeeId}</span>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <span>{profile.department}</span>
                </div>
                <div className="info-item">
                  <label>Total Clients</label>
                  <span className="value-large">
                    {profile.totalClients || 0}
                  </span>
                </div>
                <div className="info-item">
                  <label>Assets Under Management</label>
                  <span className="value-large">
                    {formatCurrency(profile.totalAUM || 0)}
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}

        {currentUser?.role === 'ADMIN' && (
          <>
            <Card className="profile-section">
              <h2>Administrative Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Department</label>
                  <span>{profile.department}</span>
                </div>
                <div className="info-item">
                  <label>System Role</label>
                  <span>{profile.systemRole}</span>
                </div>
                {profile.lastLogin && (
                  <div className="info-item">
                    <label>Last Login</label>
                    <span>{formatDate(profile.lastLogin, true)}</span>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Account Activity */}
        <Card className="profile-section">
          <h2>Account Activity</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Member Since</label>
              <span>{formatDate(profile.joinDate)}</span>
            </div>
            <div className="info-item">
              <label>Last Active</label>
              <span>{getTimeAgo(profile.lastActive)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
