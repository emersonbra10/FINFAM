import React from 'react';

export default function BackgroundGlow() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
      <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
    </div>
  );
}
