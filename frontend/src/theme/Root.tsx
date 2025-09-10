import React, { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { initPageTracking } from '../api/analytics';

interface RootProps {
  children: React.ReactNode;
}

const Root: React.FC<RootProps> = ({ children }) => {
  useEffect(() => {
    // 初始化页面访问跟踪
    initPageTracking();
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default Root;