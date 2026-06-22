import React from 'react';
import Sidebar from '../Sidebar/Sidebar';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content" style={{ paddingTop: '24px' }}>
        {children}
      </div>
    </div>
  );
};

export default SimpleLayout;