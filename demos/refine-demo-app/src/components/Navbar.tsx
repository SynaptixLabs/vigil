import React from 'react';
import { CheckSquare, Menu } from 'lucide-react';

interface NavbarProps {
  onLogout: () => void;
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, toggleSidebar }) => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button 
              onClick={toggleSidebar}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" />
            </button>
            <a href="/" className="flex ms-2 md:me-24 items-center">
              <CheckSquare className="h-8 w-8 text-blue-600 mr-2" />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">TaskPilot</span>
            </a>
          </div>
          <div className="flex items-center">
            <div className="flex items-center ms-3">
              <button onClick={onLogout} className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-testid="user-menu-btn">
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                  A
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
