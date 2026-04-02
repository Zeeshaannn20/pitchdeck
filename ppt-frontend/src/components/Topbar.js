import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Topbar = ({ professorName }) => {
  const displayName = professorName?.trim() || 'Professor';

  return (
    <div className="topbar">
      <div className="search-bar">
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search archive..." />
      </div>
      
      <div className="topbar-right">
        <button style={{ color: 'var(--text-muted)' }}>
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
