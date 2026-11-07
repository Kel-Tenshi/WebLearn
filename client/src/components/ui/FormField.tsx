import React from 'react';

interface FormFieldProps {
  label?: string;
  error?: string | null;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children, style }) => {
  return (
    <div className={`field-wrapper ${error ? 'has-error' : ''}`} style={style}>
      {label && <label className="field-label">{label}</label>}
      <div className="field-control">
        {children}
        {error && (
          <div className="field-tooltip" role="alert">
            <span className="tooltip-arrow" />
            <span className="tooltip-icon">!</span>
            <span className="tooltip-text">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};