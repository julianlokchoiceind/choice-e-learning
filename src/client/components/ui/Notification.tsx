import React from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  details?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        container: 'bg-green-500',
        icon: <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />,
        textColor: 'text-white',
        boxShadow: 'shadow-[0_8px_16px_rgba(34,197,94,0.3)]'
      };
    case 'error':
      return {
        container: 'bg-red-500',
        icon: <XCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />,
        textColor: 'text-white',
        boxShadow: 'shadow-[0_8px_16px_rgba(239,68,68,0.3)]'
      };
    case 'info':
      return {
        container: 'bg-indigo-500',
        icon: <InformationCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />,
        textColor: 'text-white',
        boxShadow: 'shadow-[0_8px_16px_rgba(99,102,241,0.3)]'
      };
    default:
      return {
        container: 'bg-gray-500',
        icon: <InformationCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />,
        textColor: 'text-white',
        boxShadow: 'shadow-lg'
      };
  }
};

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  details, 
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}) => {
  const styles = getNotificationStyles(type);
  
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, autoCloseDelay]);
  
  return (
    <div 
      className={`
        ${styles.container} 
        ${styles.boxShadow} 
        p-5 
        rounded-lg 
        relative 
        max-w-md 
        mx-auto 
        animate-fadeInDown
        border border-white/10
        backdrop-blur-sm
      `}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 mr-8">
          <p className={`text-base font-bold ${styles.textColor}`}>{message}</p>
          {details && (
            <p className={`mt-1 text-sm ${styles.textColor} opacity-90`}>{details}</p>
          )}
        </div>
        
        {onClose && (
          <button
            type="button"
            className="absolute top-4 right-4 bg-transparent rounded-md text-white hover:bg-white/10 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification; 