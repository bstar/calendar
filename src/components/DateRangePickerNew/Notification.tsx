import React, { useEffect } from 'react';

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
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="cla-notification">
      {message}
    </div>
  );
}; 