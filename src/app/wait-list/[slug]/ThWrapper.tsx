'use client';

import React, { ReactNode } from 'react';

interface ThWrapperProps {
  loading: boolean;
  children: ReactNode;
}

const ThWrapper: React.FC<ThWrapperProps> = ({ loading, children }) => {
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0A5DBC] border-solid" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ThWrapper;
