import React from 'react';

interface FormFieldProps {
  label?: string;
  error?: string | null;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  style,
  className,
}) => {
  return (
    <div className={`field-wrapper ${error ? 'has-error' : ''} ${className || ''}`} style={style}>
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