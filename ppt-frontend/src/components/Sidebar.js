import React from 'react';
import { BookOpen, LayoutDashboard, Sparkles, History, Settings, HelpCircle, LogOut, Plus } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView }) => {
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
        </button>
        <button 
          className={`nav-item ${['form', 'generating', 'completed'].includes(currentView) ? 'active' : ''}`}
          onClick={() => setCurrentView('form')}
        >
          <Sparkles size={18} />
          <span>New Generation</span>
        </button>
        <button className="nav-item">
          <History size={18} />
          <span>History</span>
        </button>
        <button className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button 
          className="btn-primary" 
          style={{ width: '100%', marginBottom: '1rem' }}
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
