import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

const Toast = ({ id, type, message, duration = 5000, onRemove }) => {
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  return (
    <div className={`toast toast-${type} ${exiting ? 'exiting' : ''}`} onClick={dismiss}>
      {ICONS[type] || ICONS.info}
      <div style={{ flex: 1 }}>
        <p style={{ color: 'white', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.4, margin: 0 }}>{message}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); dismiss(); }} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
        <X size={16} />
      </button>
      <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  );
};

// Hook for managing toasts
let toastCounter = 0;
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast('success', msg, dur),
    error: (msg, dur) => addToast('error', msg, dur),
    info: (msg, dur) => addToast('info', msg, dur),
  };

  return { toasts, removeToast, toast };
};

export default ToastContainer;
