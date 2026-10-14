import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * HashRedirect checks for legacy prototype hash URLs (e.g. #/track or #live-tracking)
 * and seamlessly redirects them to clean path-based React Router routes.
 */
export const HashRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (!hash) return;

    const hashRouteMap: Record<string, string> = {
      'track': '/track',
      'live-tracking': '/track',
      'tracking': '/track',
      'book': '/book',
      'booking': '/book',
      'services': '/services',
      'rates': '/rates',
      'hubs': '/services',
      'fleet': '/services',
      'quotes': '/book',
      'audit': '/admin/audit',
      'intelligence': '/admin/analytics',
      'faq': '/services',
      'blog': '/blogs',
      'about': '/about',
      'contact': '/contact',
      'policy': '/policies',
      'careers': '/careers',
      'admin': '/admin',
    };

    if (hashRouteMap[hash]) {
      // Clear hash and navigate to clean path route
      window.history.replaceState(null, '', window.location.pathname);
      navigate(hashRouteMap[hash], { replace: true });
    }
  }, [location, navigate]);

  return <>{children}</>;
};
