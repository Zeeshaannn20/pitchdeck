import React, { useState, useRef, useEffect } from 'react';
import { Download, BookOpen, Clock, Palette, SlidersHorizontal, Plus, LayoutDashboard, Sparkles, CheckCircle } from 'lucide-react';

const slideBgColors = ['#0F172A', '#1E293B', '#334155', '#475569', '#E2E8F0'];

const CONFETTI_COLORS = ['#EAC99D', '#4ADE80', '#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#34D399'];

const Confetti = () => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 5,
      duration: Math.random() * 1.5 + 2,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

const CompletedView = ({ formData, handleDownload, setCurrentView }) => {
  const [downloading, setDownloading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const lectureIdRef = useRef(`CUR-${Math.floor(Math.random() * 9000) + 1000}-${(formData.subject || 'GEN').substring(0,3).toUpperCase()}`);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  const onDownloadClick = async () => {
    setDownloading(true);
    await handleDownload();
    setDownloading(false);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      
      <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div style={{ animation: 'scaleIn 0.5s ease forwards' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-gold-hover)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            ✨ CURATION COMPLETE
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your presentation is ready!</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            The AI has meticulously structured your lecture on <strong style={{ color: 'var(--text-primary)' }}>"{formData.topics || formData.subject}"</strong>. Ready for export.
          </p>
        </div>

        {/* Main Download Card */}
        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'slideInUp 0.5s ease 0.1s forwards', opacity: 0 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Subject Inventory</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Lec ID: {lectureIdRef.current}</p>
            </div>
            <button 
              className="btn-gold" 
              onClick={onDownloadClick} 
              disabled={downloading}
              style={{ padding: '0.9rem 1.8rem', fontSize: '1rem' }}
            >
              <Download size={18} /> {downloading ? 'Downloading...' : 'Download .pptx'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {[
              { icon: BookOpen, label: 'PRIMARY THESIS', value: `Comprehensive analysis of ${formData.topics || 'the subject matter'}.` },
              { icon: SlidersHorizontal, label: 'SUBJECT', value: formData.subject || 'General' },
              { icon: Clock, label: 'ESTIMATED DURATION', value: `${formData.duration} Minutes` },
              { icon: Palette, label: 'VISUAL PALETTE', value: 'Deep Indigo & Gold (Premium)' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: '1rem', animation: `slideInRight 0.4s ease ${0.15 + i * 0.08}s forwards`, opacity: 0 }}>
                  <Icon size={24} color="var(--brand-gold-hover)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{item.label}</h4>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide Thumbnails */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={`stagger-${item}`}
                style={{
                  background: slideBgColors[item-1] || slideBgColors[0],
                  height: '100px', borderRadius: '8px', padding: '0.75rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  position: 'relative', overflow: 'hidden',
                  animation: `slideInUp 0.4s ease forwards`,
                  opacity: 0,
                  animationDelay: `${0.3 + item * 0.06}s`,
                  transition: 'transform 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {item === 3 && (
                  <div style={{ position: 'absolute', top: 5, right: 5, background: 'var(--brand-gold-hover)', width: '20px', height: '20px', borderRadius: '50%', opacity: 0.5 }} />
                )}
                {item % 2 === 0 && (
                  <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 40, borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
                )}
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>Slide 0{item}</span>
                <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item === 1 ? 'Title Slide' : item === 2 ? 'Agenda' : item === 5 ? 'Quiz' : `Topic ${item-2}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights + What's Included */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', animation: 'slideInUp 0.4s ease 0.4s forwards', opacity: 0 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} color="#4ADE80" /> What's Inside
            </h3>
            <ul style={{ paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>📋 Cover slide with instructor photo & batch code</li>
              {formData.previousLecture && !['first lecture', 'none', 'n/a', 'na'].includes(formData.previousLecture.toLowerCase().trim()) && (
                <li>🔁 Previous lecture recap (auto-generated)</li>
              )}
              <li>📑 Agenda slide with learning objectives</li>
              <li>📝 Topic slides with code blocks, diagrams & tables</li>
              <li>🧠 Bloom's Taxonomy quiz (5 questions)</li>
              <li>📌 Key takeaways summary slide</li>
            </ul>
          </div>
          
          <div className="card-gold" style={{ padding: '1.5rem', animation: 'slideInUp 0.4s ease 0.45s forwards', opacity: 0 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--brand-gold-hover)" /> Generation Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {[
                { label: 'Subject', value: formData.subject || 'Generic' },
                { label: 'Duration', value: `${formData.duration} min` },
                ...(formData.professorName ? [{ label: 'Instructor', value: formData.professorName }] : []),
                ...(formData.batchCode ? [{ label: 'Batch', value: formData.batchCode }] : []),
                ...(formData.specialRequirements ? [{ label: 'Directives', value: formData.specialRequirements }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '180px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '0.5rem', animation: 'slideInUp 0.4s ease 0.5s forwards', opacity: 0 }}>
          <button 
            className="btn-primary" 
            onClick={() => setCurrentView('dashboard')}
            style={{ padding: '0.9rem 2rem' }}
          >
            <LayoutDashboard size={18} /> Back to Dashboard
          </button>
          <button 
            className="btn-gold" 
            onClick={() => setCurrentView('form')}
            style={{ padding: '0.9rem 2rem' }}
          >
            <Plus size={18} /> Create Another Lecture
          </button>
        </div>

      </div>
    </>
  );
};

export default CompletedView;
