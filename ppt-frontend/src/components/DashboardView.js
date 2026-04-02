import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, Clock, ArrowRight, FileText, Cpu, CheckCircle, XCircle, Zap } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Animated counter hook
const useAnimatedCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const DashboardView = ({ setCurrentView, generationHistory }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const subjectCount = useAnimatedCounter(26);
  const genCount = useAnimatedCounter(generationHistory?.length || 0, 800);

  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
        setHealth(res.data);
      } catch {
        setHealth(null);
      } finally {
        setHealthLoading(false);
      }
    };
    checkHealth();
  }, []);

  const isBackendReady = health?.status === 'healthy' && health?.gemini_configured;
  const recentItems = (generationHistory || []).slice(-3).reverse();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Header Area */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {getGreeting()}, Professor.
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
            Your AI-powered lecture generator is ready. Select a subject, define your topics, and get a complete branded PowerPoint deck in minutes.
          </p>
          <div style={{ background: 'var(--brand-gold-light)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--brand-gold-border)' }}>
            <Clock size={14} color="var(--brand-gold-hover)" /> {currentDate}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Backend Status Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `3px solid ${healthLoading ? 'var(--border-light)' : isBackendReady ? '#4ADE80' : '#EF4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '8px' }}>
                {healthLoading ? <Cpu size={20} color="var(--text-muted)" /> : isBackendReady ? <CheckCircle size={20} color="#4ADE80" /> : <XCircle size={20} color="#EF4444" />}
              </div>
              {!healthLoading && (
                <div className={`status-dot ${isBackendReady ? 'online' : 'offline'}`} />
              )}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SYSTEM STATUS</span>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, lineHeight: 1, color: healthLoading ? 'var(--text-muted)' : isBackendReady ? '#059669' : '#DC2626' }}>
              {healthLoading ? 'Checking...' : isBackendReady ? 'Online' : 'Offline'}
            </h2>
            <p style={{ marginTop: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>
              {healthLoading ? 'Connecting to backend...' : health ? `v${health.version} · Gemini ${health.gemini_configured ? 'Ready' : 'Not Configured'}` : 'Backend is not reachable at localhost:5000'}
            </p>
          </div>
        </div>

        {/* Subjects + Generated Count */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid var(--brand-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '8px' }}>
              <ArrowUpCircle size={20} color="var(--brand-gold-hover)" />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>COVERAGE</span>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ fontSize: '3rem', margin: 0, lineHeight: 1 }}>{subjectCount}</h2>
              <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>Subjects Supported</p>
            </div>
            {(generationHistory?.length || 0) > 0 && (
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '1.8rem', margin: 0, lineHeight: 1, color: 'var(--brand-gold-hover)' }}>
                  {genCount}
                </h3>
                <p style={{ fontSize: '0.78rem', marginTop: '0.3rem', fontWeight: 500 }}>Generated</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle decorative circles */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(234,201,157,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(234,201,157,0.05)' }} />
          
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A0ABC0', letterSpacing: '0.05em', marginBottom: '1rem', zIndex: 1 }}>NEW WORKFLOW</p>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1.5rem', zIndex: 1 }}>Ignite your next lecture.</h3>
          <button className="btn-gold" onClick={() => setCurrentView('form')} disabled={!isBackendReady && !healthLoading} style={{ zIndex: 1 }}>
            Create New Presentation <ArrowRight size={18} />
          </button>
        </div>

      </div>

      {/* Generation History or Getting Started */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem' }}>{recentItems.length > 0 ? 'Recent Generations' : 'Getting Started'}</h3>
          {recentItems.length > 0 && (
            <button 
              onClick={() => setCurrentView('history')}
              style={{ fontSize: '0.85rem', color: 'var(--brand-gold-hover)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              View All <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentItems.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {recentItems.map((gen, i) => (
              <div key={i} className="card" style={{ padding: '0', overflow: 'hidden', animationDelay: `${i * 0.08}s` }}>
                <div style={{ height: '140px', background: 'linear-gradient(135deg, #0F172A, #1E293B)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
                    {gen.subject.length > 20 ? gen.subject.substring(0, 20) + '...' : gen.subject}
                  </div>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} color="rgba(255,255,255,0.4)" />
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{gen.duration} MIN LECTURE</p>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{gen.topics}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{gen.timestamp}</span>
                    <div style={{ background: 'var(--brand-gold-light)', color: 'var(--brand-gold-hover)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                      SYNTHESIZED
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { num: '1', title: 'Choose Subject', desc: 'Pick from 26 academic disciplines — from C/C++ to Machine Learning to Digital Marketing.' },
              { num: '2', title: 'Define Topics & Duration', desc: 'Specify lecture topics, subtopics, and duration (30–90 min). Add instructor details for the cover slide.' },
              { num: '3', title: 'Download Your Deck', desc: 'Gemini AI generates structured content with code blocks, diagrams, quizzes, and branded slides.' },
            ].map((step, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem', animationDelay: `${i * 0.1}s` }}>
                <div style={{ background: 'var(--brand-gold-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid var(--brand-gold-border)' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-gold-hover)' }}>{step.num}</span>
                </div>
                <h4>{step.title}</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Tech Details & Tip */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
        <div style={{ flex: 2 }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '1rem' }}>WHAT'S INCLUDED IN EACH DECK</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {[
              '📋 Cover slide with instructor photo & batch code',
              '🔁 Previous lecture recap (auto-generated)',
              '📑 Agenda slide with topic overview',
              '📝 5–20 topic slides with code, diagrams & tables',
              '🧠 Bloom\'s Taxonomy quiz (5 questions)',
              '📌 Key takeaways summary slide',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="card-gold" style={{ flex: 1, padding: '1.5rem', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-gold-hover)', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={14} /> SPECIAL DIRECTIVES
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Use keywords like <strong>"more examples"</strong>, <strong>"comparison tables"</strong>, <strong>"in depth"</strong>, or <strong>"exam focus"</strong> in Special Requirements to customize the AI output.
          </p>
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
