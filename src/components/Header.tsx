import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Avatar } from './ui';

interface HeaderProps {
  currentMember: FamilyMember;
  members: FamilyMember[];
  onSelectMember: (memberId: string) => void;
  onOpenNotifications: () => void;
  notificationCount: number;
  onLogout: () => void;
}

export default function Header({
  currentMember,
  members,
  onSelectMember,
  onOpenNotifications,
  notificationCount,
  onLogout
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header id="app-header" className="w-full top-0 sticky z-40 bg-white/2 backdrop-blur-md flex justify-between items-center px-4 py-3 select-none border-b border-white/10">
      <div className="flex items-center gap-3">
        {/* Profile Switcher */}
        <div className="relative">
          <button
            id="profile-switcher-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/30 cursor-pointer hover:scale-105 active:scale-95 transition-all focus:outline-none shadow-lg shadow-indigo-500/10"
            title="Mudar de perfil"
          >
            <Avatar 
              size="lg"
              className="w-full h-full object-cover border-2 border-indigo-500/30"
              src={currentMember.avatarUrl} 
              alt={currentMember.name} 
            />
          </button>

          {dropdownOpen && (
            <>
              <div 
                id="dropdown-overlay"
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div 
                id="dropdown-menu"
                className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-950/90 backdrop-blur-2xl border border-white/10 py-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-1.5 border-b border-white/5 mb-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Perfis da Família</p>
                </div>
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMember(m.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors ${
                      m.id === currentMember.id ? 'bg-indigo-500/20 font-semibold text-indigo-200' : 'text-slate-300'
                    }`}
                  >
                    <Avatar 
                      size="md"
                      className="border border-white/10"
                      src={m.avatarUrl} 
                      alt={m.name} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium">{m.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                    </div>
                    {m.id === currentMember.id && (
                      <span className="material-symbols-outlined text-sm text-indigo-400 font-bold">check</span>
                    )}
                  </button>
                ))}
                
                <div className="border-t border-white/5 my-1.5" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm font-bold text-rose-400">logout</span>
                  Sair da Conta
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-xl font-headline font-extrabold text-white tracking-tight bg-gradient-to-r from-indigo-200 via-fuchsia-100 to-white bg-clip-text text-transparent">FinFam</span>
          <span className="text-[10px] text-slate-400 -mt-1">Olá, {currentMember.name.split(' ')[0]}</span>
        </div>
      </div>

      <button 
        id="notification-bell-btn"
        onClick={onOpenNotifications}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors active:scale-95 relative cursor-pointer group"
      >
        <span className="material-symbols-outlined text-slate-300 text-2xl group-hover:rotate-12 transition-transform">
          notifications
        </span>
        {notificationCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-md shadow-indigo-500/20">
            {notificationCount}
          </span>
        )}
      </button>
    </header>
  );
}
