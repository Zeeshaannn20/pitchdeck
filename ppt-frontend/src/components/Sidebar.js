import React from 'react';
import { BookOpen, LayoutDashboard, Sparkles, History, Settings, HelpCircle, LogOut, Plus, Moon, Sun } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, darkMode, setDarkMode }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BookOpen size={18} />
        </div>
        <div>
          <h1>The Curator</h1>
          <p>Academic Intelligence</p>
        </div>
      </div>

      <nav className="nav-menu">
        <button 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
          <span className="kbd" style={{ marginLeft: 'auto' }}>D</span>
        </button>
        <button 
          className={`nav-item ${['form', 'generating', 'completed'].includes(currentView) ? 'active' : ''}`}
          onClick={() => setCurrentView('form')}
        >
          <Sparkles size={18} />
          <span>New Generation</span>
          <span className="kbd" style={{ marginLeft: 'auto' }}>N</span>
        </button>
        <button 
          className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          <History size={18} />
          <span>History</span>
        </button>
        <button className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--border-radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.85rem',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
        >
          {darkMode ? <Sun size={16} color="var(--brand-gold)" /> : <Moon size={16} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button 
          className="btn-primary" 
          style={{ width: '100%' }}
          onClick={() => setCurrentView('form')}
        >
          <Plus size={16} /> Generate Lecture
        </button>
        <button className="nav-item" style={{ padding: '0.5rem 0' }}>
          <HelpCircle size={18} />
          <span>Help</span>
        </button>
        <button className="nav-item" style={{ padding: '0.5rem 0' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
