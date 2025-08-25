// frontend/src/pages/client/investments/EditInvestmentPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { investmentApi } from '../../../services/api/investmentApi';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import './EditInvestmentPage.css';

interface FormData {
  name: string;
  type: string;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
  description: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  quantity?: string;
  purchasePrice?: string;
  purchaseDate?: string;
}

interface Investment {
  id: number;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  description?: string;
  notes?: string;
}

export const EditInvestmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    description: '',
    notes: '',
  });
  const [originalData, setOriginalData] = useState<FormData>({
    name: '',
    type: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    description: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [investmentTypes, setInvestmentTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvestmentData();
    }
  }, [id]);

  const fetchInvestmentData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const investmentId = parseInt(id!, 10);
      const [investmentData, types] = await Promise.all([
        investmentApi.getInvestmentById(investmentId),
        investmentApi.getInvestmentTypes(),
      ]);

      if (!investmentData) {
        setFetchError('Investment not found');
      } else {
        setInvestment(investmentData);
        const formValues = {
          name: investmentData.name,
          type: investmentData.type,
          quantity: investmentData.quantity.toString(),
          purchasePrice: investmentData.purchasePrice.toString(),
          purchaseDate: investmentData.purchaseDate,
          description: investmentData.description || '',
          notes: investmentData.notes || '',
        };
        setFormData(formValues);
        setOriginalData(formValues);
        setInvestmentTypes(types);
      }
    } catch (error) {
      setFetchError('Failed to load investment data. Please try again.');
      console.error('Error fetching investment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = 'Purchase price is required';
    } else if (parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    } else {
      const selectedDate = new Date(formData.purchaseDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !investment) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const updateData = {
        name: formData.name,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      };

      await investmentApi.updateInvestment(investment.id, updateData);
      navigate(`/client/investments/${investment.id}`);
    } catch (error) {
      setSubmitError('Failed to update investment. Please try again.');
      console.error('Error updating investment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/client/investments/${id}`);
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setSubmitError(null);
  };

  const totalCost = formData.quantity && formData.purchasePrice
    ? parseFloat(formData.quantity) * parseFloat(formData.purchasePrice)
    : 0;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="edit-investment-page">
        <div className="loading-container" role="status">
          <LoadingSpinner />
          <p>Loading investment data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="edit-investment-page">
        <div className="error-container" role="alert">
          {fetchError === 'Investment not found' ? (
            <div className="not-found">
              <h2>Investment not found</h2>
              <p>The investment you're trying to edit doesn't exist or has been removed.</p>
              <Link to="/client/investments" className="back-link">
                Back to Investments
              </Link>
            </div>
          ) : (
            <ErrorMessage message={fetchError} onRetry={fetchInvestmentData} />
          )}
        </div>
      </div>
    );
  }

  if (!investment) {
    return null;
  }

  return (
    <div className="edit-investment-page">
      <main role="main">
        <div className="page-header">
          <h1>Edit Investment</h1>
        </div>

        <form onSubmit={handleSubmit} className="investment-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="symbol">Symbol</label>
              <input
                type="text"
                id="symbol"
                value={investment.symbol}
                disabled
                className="disabled-field"
              />
              <p className="field-note">Symbol cannot be changed</p>
            </div>

            <div className="form-group">
              <label htmlFor="name">Investment Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="e.g., Apple Inc."
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={errors.type ? 'error' : ''}
              >
                <option value="">Select type</option>
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Purchase Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className={errors.quantity ? 'error' : ''}
                  placeholder="e.g., 100"
                  step="0.01"
                />
                {errors.quantity && <span className="error-message">{errors.quantity}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="purchasePrice">Purchase Price ($) *</label>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  className={errors.purchasePrice ? 'error' : ''}
                  placeholder="e.g., 150.50"
                  step="0.01"
                />
                {errors.purchasePrice && <span className="error-message">{errors.purchasePrice}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date *</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className={errors.purchaseDate ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.purchaseDate && <span className="error-message">{errors.purchaseDate}</span>}
            </div>

            {totalCost > 0 && (
              <div className="total-cost">
                <span>Total Cost:</span>
                <span className="cost-value">{formatCurrency(totalCost)}</span>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Additional Information</h2>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of the investment"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes or strategy"
              />
            </div>
          </div>

          {submitError && (
            <div className="error-banner">
              {submitError}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={submitting}
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="reset-button"
              disabled={submitting}
            >
              Reset
            </button>
            
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="small" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
