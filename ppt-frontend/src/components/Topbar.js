import React from 'react';
import { Search, Bell, User, Moon, Sun } from 'lucide-react';

const Topbar = ({ professorName, darkMode, setDarkMode }) => {
  const displayName = professorName?.trim() || 'Professor';

  return (
    <div className="topbar">
      <div className="search-bar">
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search archive..." />
      </div>
      
      <div className="topbar-right">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button style={{ color: 'var(--text-muted)', position: 'relative' }}>
          <Bell size={20} />
        </button>
        <div className="profile-pill">
          <span>{displayName}</span>
          <div className="profile-avatar">
            <User size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
