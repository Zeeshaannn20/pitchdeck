import React from 'react';
import { ArrowRight, Image as ImageIcon, Info, Zap } from 'lucide-react';

// Backend-supported special requirement keywords
const DIRECTIVE_CHIPS = [
  { label: 'More Examples', value: 'more examples' },
  { label: 'Comparison Tables', value: 'comparison tables' },
  { label: 'In Depth', value: 'in depth' },
  { label: 'Diagrams & Visuals', value: 'diagrams' },
  { label: 'Simple / Beginner', value: 'simple beginner' },
  { label: 'Exam Focus', value: 'exam focus' },
  { label: 'Industry Use Cases', value: 'industry real world' },
  { label: 'Code Heavy', value: 'code implementation' },
];

const NewGenerationView = ({ 
  formData, 
  setFormData, 
  handleImageUpload, 
  onGenerate, 
  subjects, 
  durationOptions,
  isGenerateDisabled,
  error 
}) => {

  const toggleDirective = (value) => {
    const current = formData.specialRequirements;
    if (current.toLowerCase().includes(value.toLowerCase())) {
      setFormData({...formData, specialRequirements: current.replace(new RegExp(value, 'gi'), '').replace(/\s{2,}/g, ' ').trim()});
    } else {
      setFormData({...formData, specialRequirements: (current ? current + ', ' : '') + value});
    }
  };

  const isDirectiveActive = (value) => {
    return formData.specialRequirements.toLowerCase().includes(value.toLowerCase());
  };

  // Get duration description based on backend's _duration_to_slide_guidance
  const getDurationInfo = (dur) => {
    if (dur <= 30) return '3–5 topic slides · Concise';
    if (dur <= 45) return '4–7 topic slides · Moderate depth';
    if (dur <= 60) return '5–10 topic slides · Thorough with full examples';
    if (dur <= 90) return '7–14 topic slides · Comprehensive with diagrams';
    return '10–20 topic slides · Highly detailed';
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>NEW WORKFLOW</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Curate a Lecture</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Define your parameters and let Gemini synthesize a complete, branded slide deck.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#991B1B', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Info size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Generation Failed:</strong> {error}
          </div>
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Core Parameters */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>Academic Parameters</h3>
          
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Subject Domain <span style={{ color: '#DC2626' }}>*</span></label>
              <select 
                className="form-input" 
                value={formData.subject} 
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              >
                <option value="">Select from 26 supported subjects</option>
                {subjects.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Content rules, code language, and diagram styles auto-adapt per subject.
              </p>
            </div>
            <div className="form-col">
              <label className="form-label">Lecture Duration</label>
              <select 
                className="form-input" 
                value={formData.duration} 
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value, 10)})}
              >
                {durationOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>{minutes} minutes</option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {getDurationInfo(formData.duration)}
              </p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Primary Topics <span style={{ color: '#DC2626' }}>*</span></label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g., Backpropagation, Gradient Descent"
                value={formData.topics}
                onChange={(e) => setFormData({...formData, topics: e.target.value})}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Each topic gets dedicated slides. The AI detects whether content is theoretical, practical, or mixed.
              </p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Subtopics (Optional)</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g., Mathematics, Implementation, Common Pitfalls"
                value={formData.subtopics}
                onChange={(e) => setFormData({...formData, subtopics: e.target.value})}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Comma-separated. Each subtopic = 1 dedicated slide. Overrides syllabus-based topics when specified.
              </p>
            </div>
          </div>
        </div>

        {/* Narrative flow */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>Narrative Flow</h3>
          
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Previous Lecture Topic</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="What was covered last class? (Leave blank or type 'first lecture' to skip recap)"
                value={formData.previousLecture}
                onChange={(e) => setFormData({...formData, previousLecture: e.target.value})}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Generates a recap slide bridging past content to today's topics. Use "first lecture", "none", or "n/a" to skip.
              </p>
            </div>
            <div className="form-col">
              <label className="form-label">Batch / Section Code</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g., CS-401A"
                value={formData.batchCode}
                onChange={(e) => setFormData({...formData, batchCode: e.target.value})}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Displayed on the cover slide's batch pill.
              </p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={14} color="var(--brand-gold-hover)" /> Special AI Directives
              </label>
              
              {/* Quick-toggle chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {DIRECTIVE_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => toggleDirective(chip.value)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      border: `1px solid ${isDirectiveActive(chip.value) ? 'var(--brand-navy)' : 'var(--border-light)'}`,
                      background: isDirectiveActive(chip.value) ? 'var(--brand-navy)' : 'transparent',
                      color: isDirectiveActive(chip.value) ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Or type custom directives. e.g., 'Focus on practical implementations with real-world industry examples. Keep language simple for beginners.'"
                value={formData.specialRequirements}
                onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                These override subject rules. The AI interprets keywords like "examples", "comparison", "detail", "diagram", "simple", "exam", "industry", "code".
              </p>
            </div>
          </div>
        </div>

        {/* Presenter Info */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>Presenter Identity (Cover Slide)</h3>
          
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Professor Name</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g., Dr. Alakh Pandey"
                value={formData.professorName}
                onChange={(e) => setFormData({...formData, professorName: e.target.value})}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Qualification / Experience</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g., Ph.D. Computer Science | Founder, PW"
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Presenter Avatar</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, border: '1px solid var(--border-light)' }}>
                  <ImageIcon size={16} /> Choose Image
                  <input 
                    type="file" 
                    accept="image/png,image/jpeg,image/webp" 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload}
                  />
                </label>
                {formData.imagePreview && (
                  <img src={formData.imagePreview} alt="preview" style={{ height: '40px', borderRadius: '50%' }} />
                )}
                {formData.imageFile && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formData.imageFile.name}</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                PNG, JPG, or WebP · Max 3 MB · Embedded on the cover slide with aspect-ratio framing.
              </p>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {!formData.subject && !formData.topics ? 'Subject and Topics are required.' : 
             !formData.subject ? 'Select a subject to continue.' : 
             !formData.topics ? 'Add at least one topic to continue.' :
             `Ready to synthesize ${formData.duration}-minute lecture on "${formData.topics.substring(0,40)}${formData.topics.length > 40 ? '...' : ''}"`}
          </p>
          <button 
            className="btn-gold" 
            onClick={onGenerate}
            disabled={isGenerateDisabled}
            style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}
          >
            Synthesize Lecture <ArrowRight size={18} />
          </button>
        </div>

      </div>

    </div>
  );
};

export default NewGenerationView;
