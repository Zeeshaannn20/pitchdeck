import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, Clock, ArrowRight, ExternalLink, FileText, Cpu, CheckCircle, XCircle, Zap } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const DashboardView = ({ setCurrentView, generationHistory }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

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

  // Use real generation history or show helpful empty state
  const recentItems = (generationHistory || []).slice(-3).reverse();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Header Area */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome back, Professor.</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
            Your AI-powered lecture generator is ready. Select a subject, define your topics, and get a complete branded PowerPoint deck in minutes.
          </p>
          <div style={{ background: 'var(--brand-gold-light)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--brand-gold-border)' }}>
            <Clock size={14} color="var(--brand-gold-hover)" /> {currentDate}
          </div>
        </div>
      </div>

      {/* Stats Row - Backend Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Backend Status Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `3px solid ${healthLoading ? 'var(--border-light)' : isBackendReady ? '#4ADE80' : '#EF4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: '#F3F4F6', padding: '0.5rem', borderRadius: '8px' }}>
              {healthLoading ? <Cpu size={20} color="var(--text-muted)" /> : isBackendReady ? <CheckCircle size={20} color="#4ADE80" /> : <XCircle size={20} color="#EF4444" />}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A0ABC0', letterSpacing: '0.05em' }}>SYSTEM STATUS</span>
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

        {/* Supported Subjects Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid var(--brand-navy)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: '#F3F4F6', padding: '0.5rem', borderRadius: '8px' }}>
              <ArrowUpCircle size={20} color="var(--brand-navy)" />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A0ABC0', letterSpacing: '0.05em' }}>COVERAGE</span>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '3rem', margin: 0, lineHeight: 1 }}>26</h2>
            <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>Subject Disciplines Supported</p>
          </div>
        </div>

        {/* CTA Card */}
        <div className="card" style={{ background: 'var(--brand-navy)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A0ABC0', letterSpacing: '0.05em', marginBottom: '1rem' }}>NEW WORKFLOW</p>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>Ignite your next lecture.</h3>
          <button className="btn-gold" onClick={() => setCurrentView('form')} disabled={!isBackendReady && !healthLoading}>
            Create New Presentation <ArrowRight size={18} />
          </button>
        </div>

      </div>

      {/* Generation History or Getting Started */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem' }}>{recentItems.length > 0 ? 'Recent Generations' : 'Getting Started'}</h3>
        </div>

        {recentItems.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {recentItems.map((gen, i) => (
              <div key={i} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '140px', background: 'var(--brand-navy)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                    {gen.subject.length > 20 ? gen.subject.substring(0, 20) + '...' : gen.subject}
                  </div>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          /* Getting Started Cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: 'var(--brand-gold-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>1</span>
              </div>
              <h4>Choose Subject</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Pick from 26 academic disciplines — from C/C++ to Machine Learning to Digital Marketing.</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: 'var(--brand-gold-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>2</span>
              </div>
              <h4>Define Topics & Duration</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Specify lecture topics, subtopics, and duration (30–90 min). Add instructor details for the cover slide.</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: 'var(--brand-gold-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>3</span>
              </div>
              <h4>Download Your Deck</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Gemini AI generates structured content with code blocks, diagrams, quizzes, and branded slides.</p>
            </div>
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
