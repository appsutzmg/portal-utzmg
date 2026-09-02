import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="font-medium">v1.0</span>
          </div>
          <div className="flex items-center space-x-6">
            <a 
              href="https://utzmg.edu.mx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-utzmg-green dark:hover:text-emerald-400 transition-colors"
            >
              Sitio Oficial UTZMG
            </a>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <a 
              href="mailto:apps@utzmg.edu.mx" 
              className="hover:text-utzmg-green dark:hover:text-emerald-400 transition-colors"
            >
              Soporte: apps@utzmg.edu.mx
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
