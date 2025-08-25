// frontend/src/pages/client/investments/CreateInvestmentPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { investmentApi } from '../../../services/api/investmentApi';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import './CreateInvestmentPage.css';

interface FormData {
  name: string;
  symbol: string;
  type: string;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
  description: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  symbol?: string;
  type?: string;
  quantity?: string;
  purchasePrice?: string;
  purchaseDate?: string;
}

interface SecuritySearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export const CreateInvestmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    symbol: '',
    type: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
    description: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [investmentTypes, setInvestmentTypes] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SecuritySearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestmentTypes();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.symbol.length >= 1) {
        searchSecurities();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.symbol]);

  const fetchInvestmentTypes = async () => {
    try {
      const types = await investmentApi.getInvestmentTypes();
      setInvestmentTypes(types);
    } catch (error) {
      console.error('Error fetching investment types:', error);
    }
  };

  const searchSecurities = async () => {
    try {
      const results = await investmentApi.searchSecurities(formData.symbol);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching securities:', error);
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

  const handleSecuritySelect = (security: SecuritySearchResult) => {
    setFormData(prev => ({
      ...prev,
      name: security.name,
      symbol: security.symbol,
    }));
    setShowSearchResults(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
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
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const investmentData = {
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      };

      await investmentApi.createInvestment(investmentData);
      navigate('/client/investments');
    } catch (error) {
      setSubmitError('Failed to create investment. Please try again.');
      console.error('Error creating investment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/client/investments');
  };

  const handleReset = () => {
    setFormData({
      name: '',
      symbol: '',
      type: '',
      quantity: '',
      purchasePrice: '',
      purchaseDate: '',
      description: '',
      notes: '',
    });
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

  return (
    <div className="create-investment-page">
      <main role="main">
        <div className="page-header">
          <h1>Add New Investment</h1>
        </div>

        <form onSubmit={handleSubmit} className="investment-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="symbol">Symbol *</label>
              <div className="symbol-search">
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className={errors.symbol ? 'error' : ''}
                  placeholder="e.g., AAPL"
                  autoComplete="off"
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="search-result"
                        onClick={() => handleSecuritySelect(result)}
                      >
                        <span className="result-symbol">{result.symbol}</span>
                        <span className="result-name">{result.name}</span>
                        <span className="result-exchange">{result.exchange}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.symbol && <span className="error-message">{errors.symbol}</span>}
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
                  Adding Investment...
                </>
              ) : (
                'Add Investment'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
