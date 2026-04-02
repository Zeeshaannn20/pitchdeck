import React, { useState, useRef } from 'react';
import { Download, BookOpen, Clock, Palette, SlidersHorizontal, Plus, LayoutDashboard, Sparkles, CheckCircle } from 'lucide-react';

const slideBgColors = ['#0F172A', '#1E293B', '#334155', '#475569', '#E2E8F0'];

const CompletedView = ({ formData, handleDownload, setCurrentView }) => {
  const [downloading, setDownloading] = useState(false);
  const lectureIdRef = useRef(`CUR-${Math.floor(Math.random() * 9000) + 1000}-${(formData.subject || 'GEN').substring(0,3).toUpperCase()}`);

  const onDownloadClick = async () => {
    setDownloading(true);
    await handleDownload();
    setDownloading(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-gold-hover)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>CURATION COMPLETE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your presentation is ready!</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          The AI has meticulously structured your lecture on <strong style={{ color: 'var(--text-primary)' }}>"{formData.topics || formData.subject}"</strong>. Ready for export and refinement.
        </p>
      </div>

      {/* Main Download Card */}
      <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Subject Inventory</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Lec ID: {lectureIdRef.current}</p>
          </div>
          <button 
            className="btn-primary" 
            onClick={onDownloadClick} 
            disabled={downloading}
            style={{ padding: '0.8rem 1.5rem', border: '1px solid var(--text-primary)' }}
          >
            <Download size={18} /> {downloading ? 'Downloading...' : 'Download .pptx'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <BookOpen size={24} color="var(--brand-gold-hover)" style={{ marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>PRIMARY THESIS</h4>
              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Comprehensive analysis of {formData.topics || 'the subject matter'}.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <SlidersHorizontal size={24} color="var(--brand-gold-hover)" style={{ marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>SUBJECT</h4>
              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{formData.subject || 'General'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Clock size={24} color="var(--brand-gold-hover)" style={{ marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>ESTIMATED DURATION</h4>
              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{formData.duration} Minutes</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Palette size={24} color="var(--brand-gold-hover)" style={{ marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>VISUAL PALETTE</h4>
              <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Deep Indigo & Gold (Premium)</p>
            </div>
          </div>
        </div>

        {/* Slide Thumbnails */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} style={{ background: slideBgColors[item-1] || slideBgColors[0], height: '100px', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}>
              {item === 3 && (
                 <div style={{ position: 'absolute', top: 5, right: 5, background: 'var(--brand-gold-hover)', width: '20px', height: '20px', borderRadius: '50%', opacity: 0.5 }}></div>
              )}
              {item % 2 === 0 && (
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 40, borderLeft: '1px solid rgba(255,255,255,0.1)' }}></div>
              )}
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>Slide 0{item}</span>
              <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item === 1 ? 'Title Slide' : item === 2 ? 'Agenda' : item === 5 ? 'Quiz' : `Topic ${item-2}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights + What's Included */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ background: '#F8FAFC', padding: '1.5rem' }}>
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
        
        <div className="card-gold" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--brand-gold-hover)" /> Generation Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subject</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '180px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.subject || 'Generic'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Duration</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.duration} min</span>
            </div>
            {formData.professorName && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Instructor</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.professorName}</span>
              </div>
            )}
            {formData.batchCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Batch</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formData.batchCode}</span>
              </div>
            )}
            {formData.specialRequirements && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Directives</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '180px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.specialRequirements}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '0.5rem' }}>
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
  );
};

export default CompletedView;
