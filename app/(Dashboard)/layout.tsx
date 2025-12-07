"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from './client-layout';
import { isAuthenticated } from '@/lib/utils/auth';

interface LayoutProps {
  children: React.ReactNode;
}


const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsChecking(false);
  }, [router]);

  // Show nothing while checking auth
  if (isChecking) {
    return null;
  }

  return (
    <ClientLayout>{children}</ClientLayout>
  );
};

export default Layout;
