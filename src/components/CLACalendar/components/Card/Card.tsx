import React from 'react';
import { CardProps, CardCompositionProps, CardComponent } from './Card.types';
import './Card.css';

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={`cla-card ${className || ''}`} {...props}>
    {children}
  </div>
)) as CardComponent;

Card.Header = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-header ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-body ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className, ...props }: CardCompositionProps) => (
  <div className={`cla-card-footer ${className || ''}`} {...props}>
    {children}
  </div>
);

Card.displayName = 'Card';