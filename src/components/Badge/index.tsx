import React from 'react';
import './styles.css';

interface BadgeProps {
  children: React.ReactNode;
  colorScheme?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, colorScheme = '1', className = '' }) => {
  return (
    <span className={`custom-badge color-${colorScheme} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;