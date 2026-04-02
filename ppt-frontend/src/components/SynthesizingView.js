import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, TerminalSquare, Cpu, Sparkles, Image, FileText, Download, CheckCircle } from 'lucide-react';

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

const PIPELINE_STAGES = [
  { id: 'prompt', label: 'Prompt Engineering', icon: Cpu, threshold: 0 },
  { id: 'content', label: 'Content Generation', icon: Sparkles, threshold: 20000 },
  { id: 'images', label: 'Image Synthesis', icon: Image, threshold: 37000 },
  { id: 'render', label: 'Slide Rendering', icon: FileText, threshold: 50000 },
  { id: 'finalize', label: 'Finalization', icon: Download, threshold: 65000 },
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

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (offsetMs) => {
    const d = new Date(startRef.current + offsetMs);
    return `[${d.toLocaleTimeString('en-US', { hour12: false })}]`;
  };

  // Estimated time remaining
  const estimatedTotal = 90; // seconds
  const etaSeconds = Math.max(0, estimatedTotal - Math.floor(elapsed / 1000));
  const etaDisplay = etaSeconds > 60 ? `~${Math.ceil(etaSeconds / 60)}m ${etaSeconds % 60}s` : `~${etaSeconds}s`;

  const getStageStatus = (stage) => {
    const stageIdx = PIPELINE_STAGES.findIndex(s => s.id === stage.id);
    const nextStage = PIPELINE_STAGES[stageIdx + 1];
    if (nextStage && elapsed >= nextStage.threshold) return 'done';
    if (elapsed >= stage.threshold) return 'active';
    return 'pending';
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-gold-hover)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>SYSTEM STATUS: ACTIVE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Synthesizing Lecture</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Gemini AI is generating pedagogical structure for your parameters.</p>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 300, lineHeight: 0.8, color: 'var(--text-primary)' }}>
              {Math.floor(progress)}<span style={{ fontSize: '1.5rem' }}>%</span>
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>ETA: {etaDisplay}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0F172A, #1E293B, #334155)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        <span>• {formData.subject} — {formData.topics?.substring(0, 40)}</span>
        <span>Elapsed: {Math.floor(elapsed/1000)}s</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        
        {/* Terminal Window */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ background: '#E2E8F0', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
              <TerminalSquare size={16} /> Pipeline Log
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FCA5A5' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FDE047' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#86EFAC' }} />
            </div>
          </div>
          <div ref={logRef} style={{ background: '#0A0A0A', flex: 1, padding: '1.5rem', minHeight: '350px', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.82rem', animation: 'slideInUp 0.3s ease forwards' }}>
                <span style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>{formatTimestamp(log.time_offset)}</span>
                <span style={{ color: log.color || '#D4D4D4', lineHeight: 1.4 }}>{log.text}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.82rem' }}>
              <span style={{ color: '#6B7280' }}>_</span>
              <span style={{ background: '#D4D4D4', width: '8px', height: '14px', alignSelf: 'center', animation: 'blink 1.2s step-end infinite' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pipeline Stages */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Pipeline Stages</h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {PIPELINE_STAGES.map((stage) => {
                const status = getStageStatus(stage);
                const Icon = stage.icon;
                return (
                  <div key={stage.id} className={`stage-step ${status}`}>
                    <div className="stage-icon">
                      {status === 'done' ? (
                        <CheckCircle size={14} color="#4ADE80" />
                      ) : status === 'active' ? (
                        <Icon size={14} color="var(--brand-gold-hover)" />
                      ) : (
                        <Icon size={14} color="var(--text-muted)" />
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: status === 'active' ? 600 : 400 }}>
                      {stage.label}
                    </span>
                    {status === 'active' && (
                      <Loader2 size={14} className="spin-icon" style={{ marginLeft: 'auto', color: 'var(--brand-gold-hover)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parameters Card */}
          <div className="card-gold" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldCheck size={18} color="var(--brand-gold-hover)" />
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--brand-gold-hover)', margin: 0, textTransform: 'uppercase' }}>Generation Parameters</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Subject', value: formData.subject || 'Generic' },
                { label: 'Duration', value: `${formData.duration} min` },
                { label: 'Topics', value: formData.topics?.substring(0, 25) || '—' },
                ...(formData.professorName ? [{ label: 'Instructor', value: formData.professorName }] : []),
                ...(formData.batchCode ? [{ label: 'Batch', value: formData.batchCode }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '140px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass)', backdropFilter: 'blur(8px)', padding: '0.75rem 1.5rem', borderRadius: '30px', boxShadow: 'var(--shadow-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
          <Loader2 size={16} className="spin-icon" /> Generation typically takes 60–120 seconds depending on complexity.
        </p>
      </div>
    </div>
  );
};

export default SynthesizingView;
