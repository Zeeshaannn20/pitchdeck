import React from 'react';
import { Clock, BookOpen, RefreshCw, Sparkles, ArrowRight, Cpu } from 'lucide-react';

const HistoryView = ({ generationHistory, setCurrentView, setFormData }) => {
  const items = [...(generationHistory || [])].reverse();

  const handleRegenerate = (item) => {
    setFormData(prev => ({
      ...prev,
      subject: item.subject || '',
      topics: item.topics || '',
      duration: item.duration || 60,
      model: item.model || 'gemini-2.0-flash',
    }));
    setCurrentView('form');
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>

      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          GENERATION LOG
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>History</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          {items.length > 0
            ? `${items.length} presentation${items.length > 1 ? 's' : ''} generated this session.`
            : 'No presentations generated yet. Start by creating your first lecture.'}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="history-timeline">
          {items.map((item, i) => (
            <div
              key={i}
              className="history-item"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="card" style={{ marginLeft: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                      {item.topics?.length > 50 ? item.topics.substring(0, 50) + '...' : item.topics}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        <BookOpen size={13} /> {item.subject?.length > 25 ? item.subject.substring(0, 25) + '...' : item.subject}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        <Clock size={13} /> {item.duration} min
                      </span>
                      {item.model && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          <Cpu size={13} /> {item.model.replace(/-preview.*/, '')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRegenerate(item)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      background: 'var(--brand-gold-light)',
                      color: 'var(--brand-gold-hover)',
                      border: '1px solid var(--brand-gold-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={13} /> Regenerate
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.timestamp}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4ADE80', letterSpacing: '0.03em' }}>✓ COMPLETED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--brand-gold-light)', border: '1px solid var(--brand-gold-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Sparkles size={28} color="var(--brand-gold-hover)" />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Generations Yet</h3>
          <p style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Create your first AI-powered lecture presentation. Each generation will be logged here for easy access.
          </p>
          <button className="btn-gold" onClick={() => setCurrentView('form')} style={{ padding: '0.8rem 1.5rem' }}>
            Create First Lecture <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryView;








