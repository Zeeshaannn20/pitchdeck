import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, TerminalSquare } from 'lucide-react';

// These log messages mirror the actual backend pipeline stages
const LOG_PHASES = [
  { time_offset: 0, text: "Session initialized. Connection to backend established.", color: "#EAB308" },
  { time_offset: 2000, text: "Payload accepted. Subject category identified.", color: "#D4D4D4" },
  { time_offset: 5000, text: "Topic nature analysis: sniffing theoretical vs practical signals...", color: "#D4D4D4" },
  { time_offset: 9000, text: "Building Gemini prompt with subject-specific rules...", color: "#D4D4D4" },
  { time_offset: 13000, text: "Injecting code language policy and Bloom's taxonomy quiz rules.", color: "#4ADE80" },
  { time_offset: 16000, text: "Syllabus loader: checking for per-subject JSON syllabus match...", color: "#D4D4D4" },
  { time_offset: 20000, text: "Calling Gemini API (gemini-2.0-flash) for content generation...", color: "#60A5FA" },
  { time_offset: 28000, text: "Gemini response received. Extracting largest balanced JSON object...", color: "#4ADE80" },
  { time_offset: 33000, text: "JSON structure validated. Topics normalized to list-of-lists format.", color: "#D4D4D4" },
  { time_offset: 37000, text: "Prefetching images via Gemini Image API (4 concurrent workers)...", color: "#60A5FA" },
  { time_offset: 45000, text: "Image generation complete. Placeholder fallback applied where needed.", color: "#D4D4D4" },
  { time_offset: 50000, text: "Building cover slide: logo, instructor photo, batch code pill...", color: "#D4D4D4" },
  { time_offset: 55000, text: "Rendering topic slides with semantic content (code blocks, tables, diagrams)...", color: "#60A5FA" },
  { time_offset: 62000, text: "Creating Bloom's Taxonomy quiz slides (5 questions, 2 per slide)...", color: "#D4D4D4" },
  { time_offset: 67000, text: "Assembling Key Takeaways summary and applying gold accent theme...", color: "#D4D4D4" },
  { time_offset: 72000, text: "Writing .pptx binary to temp directory. Preparing download stream...", color: "#4ADE80" },
];

const SynthesizingView = ({ formData }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const logRef = useRef(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const msPassed = Date.now() - startRef.current;
      setElapsed(msPassed);
      
      // Progress: ramps up to 95% over ~80 seconds then crawls
      const pct = msPassed < 80000 
        ? (msPassed / 80000) * 95 
        : 95 + (msPassed - 80000) / 200000 * 4;
      setProgress(Math.min(99, pct));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const visibleLogs = LOG_PHASES.filter(msg => elapsed >= msg.time_offset);
    if (visibleLogs.length !== logs.length) {
      setLogs(visibleLogs);
    }
  }, [elapsed, logs.length]);

  // Auto-scroll terminal
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (offsetMs) => {
    const d = new Date(startRef.current + offsetMs);
    return `[${d.toLocaleTimeString('en-US', { hour12: false })}]`;
  };

  // Determine which stage we're in for the sidebar
  const getStageInfo = () => {
    if (elapsed < 20000) return { stage: 'Prompt Engineering', detail: 'Building optimized Gemini prompt with subject-specific rules' };
    if (elapsed < 35000) return { stage: 'Content Generation', detail: 'Gemini AI is synthesizing pedagogical content structure' };
    if (elapsed < 50000) return { stage: 'Image Synthesis', detail: 'Generating AI diagrams and visual assets concurrently' };
    if (elapsed < 65000) return { stage: 'Slide Rendering', detail: 'python-pptx engine rendering slides with branded theme' };
    return { stage: 'Finalization', detail: 'Assembling binary .pptx file buffer for download' };
  };

  const stageInfo = getStageInfo();

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-gold-hover)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>SYSTEM STATUS: ACTIVE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Synthesizing Lecture</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Gemini AI is generating pedagogical structure for your parameters.</p>
          <span style={{ fontSize: '3.5rem', fontWeight: 300, lineHeight: 0.8, color: 'var(--brand-navy)' }}>{Math.floor(progress)}<span style={{ fontSize: '1.5rem' }}>%</span></span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: 'var(--border-light)', height: '12px', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--brand-navy)', width: `${progress}%`, transition: 'width 1s ease', borderRadius: '10px' }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        <span>• Stage: {stageInfo.stage} — {formData.subject}</span>
        <span>Elapsed: {Math.floor(elapsed/1000)}s</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        
        {/* Terminal Window */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ background: '#E2E8F0', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <TerminalSquare size={16} /> Pipeline Log
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FCA5A5' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FDE047' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#86EFAC' }}></div>
            </div>
          </div>
          <div ref={logRef} style={{ background: '#0A0A0A', flex: 1, padding: '1.5rem', minHeight: '350px', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.82rem' }}>
                <span style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>{formatTimestamp(log.time_offset)}</span>
                <span style={{ color: log.color || '#D4D4D4', lineHeight: 1.4 }}>{log.text}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.82rem' }}>
              <span style={{ color: '#6B7280' }}>_</span>
              <span style={{ background: '#D4D4D4', width: '8px', height: '14px', alignSelf: 'center', animation: 'blink 1.2s step-end infinite' }}></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Current Stage Card */}
          <div className="card-gold" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <ShieldCheck size={32} color="var(--brand-gold-hover)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--brand-navy)' }}>{stageInfo.stage}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, zIndex: 1 }}>
              {stageInfo.detail}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '2rem', zIndex: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-navy)', border: '1px solid var(--brand-gold-border)' }}>
                <ShieldCheck size={14} color="#4ADE80" /> Powered by Gemini 2.0 Flash
              </span>
            </div>
          </div>

          {/* Parameters Card */}
          <div className="card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Generation Parameters</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Subject</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '140px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.subject || 'Generic'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Duration</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formData.duration} min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Topics</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '140px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.topics.substring(0, 25) || '—'}</span>
              </div>
              {formData.professorName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instructor</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formData.professorName}</span>
                </div>
              )}
              {formData.batchCode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Batch</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formData.batchCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.75rem 1.5rem', borderRadius: '30px', boxShadow: 'var(--shadow-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={16} className="spin-icon" /> Generation typically takes 60–120 seconds depending on complexity.
        </p>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .spin-icon { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default SynthesizingView;
