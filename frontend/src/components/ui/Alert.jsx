import React from 'react';

export default function Alert({ type = 'info', message, className = '' }) {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const icons = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} ${className}`}>
      <div className="flex items-center">
        <span className="mr-2">{icons[type]}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}