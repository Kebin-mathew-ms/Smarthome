import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { WifiOff } from 'lucide-react';

const OfflineNotifier = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, width: 320 }}>
      <Alert
        message="Internet Connection Lost"
        description="You are currently offline. Changes will automatically sync when reconnected."
        type="warning"
        showIcon
        icon={<WifiOff size={20} />}
      />
    </div>
  );
};

export default OfflineNotifier;
