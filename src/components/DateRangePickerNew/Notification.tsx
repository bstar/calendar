import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({ 
  message, 
  onDismiss, 
  duration = 3000 
}) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 300); // Start fade out 300ms before dismissal

    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  return (
    <div className={`cla-notification ${isFading ? 'fade-out' : ''}`}>
      <span className="cla-notification-message">{message}</span>
      <button 
        className="cla-notification-dismiss" 
        onClick={(e) => {
          e.stopPropagation();
          setIsFading(true);
          setTimeout(onDismiss, 300); // Wait for fade out animation
        }}
      >
        ×
      </button>
    </div>
  );
}; 