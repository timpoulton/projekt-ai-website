import React from 'react';

export function Alert({ children, variant = "default" }) {
  const baseStyle = "p-4 mb-4 rounded-lg border";
  const variants = {
    default: "bg-zinc-900 border-zinc-800 text-zinc-300",
    error: "bg-red-900/50 border-red-700 text-red-200",
    success: "bg-green-900/50 border-green-700 text-green-200",
  };

  return (
    <div className={`${baseStyle} ${variants[variant]}`}>
      {children}
    </div>
  );
}

export function AlertTitle({ children }) {
  return <h5 className="font-medium mb-1">{children}</h5>;
}

export function AlertDescription({ children }) {
  return <div className="text-sm opacity-90">{children}</div>;
}
