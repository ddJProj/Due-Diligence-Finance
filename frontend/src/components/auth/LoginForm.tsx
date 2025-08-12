/* frontend/src/components/auth/LoginForm.css */

.login-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.75rem;
  font-weight: 600;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid #fcc;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.form-input.error {
  border-color: #c33;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  color: #666;
  transition: color 0.2s;
}

.password-toggle:hover:not(:disabled) {
  color: #333;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.field-error {
  display: block;
  margin-top: 0.25rem;
  color: #c33;
  font-size: 0.75rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #555;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.link-button {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
  padding: 0;
}

.link-button:hover:not(:disabled) {
  color: #1565c0;
  text-decoration: underline;
}

.link-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.submit-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #1565c0;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #555;
}

.form-footer span {
  margin-right: 0.5rem;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-form-container {
    padding: 1rem;
  }

  .login-form {
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

/* Animation for form appearance */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form {
  animation: fadeIn 0.3s ease-out;
}

/* Focus visible for accessibility */
.form-input:focus-visible,
.password-toggle:focus-visible,
.link-button:focus-visible,
.submit-button:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}
