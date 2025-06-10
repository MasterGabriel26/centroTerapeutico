import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hoverable?: boolean;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  hoverable = false,
  footer,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm overflow-hidden
        ${hoverable ? 'transition-all duration-200 hover:shadow-md' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
          {title && <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className={`${title || subtitle ? '' : 'p-4 sm:p-6'}`}>
        {children}
      </div>
      
      {footer && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};