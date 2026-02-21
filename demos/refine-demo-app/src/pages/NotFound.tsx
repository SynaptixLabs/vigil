import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="ml-64 flex flex-col items-center justify-center h-[60vh] text-center">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
      <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-1">Page not found</p>
      <p className="text-sm text-gray-400 mb-8">The page you were looking for doesn't exist or has been moved.</p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        data-testid="notfound-btn-home"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
