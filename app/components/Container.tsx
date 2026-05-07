import React from 'react';

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[90%] mx-auto max-w-[1700px]">
      {children}
    </div>
  );
}