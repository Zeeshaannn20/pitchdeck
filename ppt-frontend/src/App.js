import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import './index.css';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import NewGenerationView from './components/NewGenerationView';
import SynthesizingView from './components/SynthesizingView';
import CompletedView from './components/CompletedView';
import HistoryView from './components/HistoryView';
import ToastContainer, { useToast } from './components/ToastNotification';

const API_BASE_URL = 'http://localhost:5000';

const SUBJECTS = [
  'Programming Principles and Practice with C and C++',
  'Computer Organization and Architecture',
  'Frontend Developer (HTML, CSS, JS)',
  'Object Oriented Programming using Java',
  'Database Management System',
  'Javascript Web Developer (Advance JS)',
  'Operating System',
  'Python for Data Science',
  'Data Visualization using Excel and Powerbi',
  'Java Web Developer (Spring Boot)',
  'Fundamental of Machine Learning',
  'Computer Networks',
  'Formal Language and Automata Theory',
  'Frontend Developer (React JS)',
  'Backend Development (NodeJS & ExpressJS)',
  'Network Security',
  'Introduction to Artificial Intelligence',
  'Mobile Developer (Android)',
  'Cloud Computing and DevOps',
  'Fullstack Development (MERN)',
  'Tech-Product Development',
  'Machine Learning Engineer',
  'Software Quality Assurance',
  'Advance Backend Development (Golang)',
  'Digital Presence & Strategic Networking',
  'Essentials of Digital Marketing',
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [downloadBlob, setDownloadBlob] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('curator-theme') === 'dark';
  });

  const { toasts, removeToast, toast } = useToast();

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('curator-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const [formData, setFormData] = useState({
    subject: '',
    topics: '',
    subtopics: '',
    previousLecture: '',
    duration: 60,
    specialRequirements: '',
    professorName: '',
    qualification: '',
    imageFile: null,
    imageBase64: '',
    imagePreview: '',
    batchCode: '',
  });

  const durationOptions = useMemo(() => {
    const opts = [];
    for (let min = 30; min <= 90; min += 15) opts.push(min);
    return opts;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't fire if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCurrentView('form');
      }
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setCurrentView('dashboard');
      }
      if (e.key === 'Escape') {
        setCurrentView('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or WEBP image.');
      e.target.value = '';
      return;
    }
    const maxBytes = 3 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Image too large. Please keep it under 3 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result || '';
      const b64 = String(result).split(',')[1] || '';
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageBase64: b64,
        imagePreview: result
      }));
      toast.success(`Image "${file.name}" uploaded successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setCurrentView('generating');

    const payload = {
      subject: formData.subject.trim(),
      topics: formData.topics.trim(),
      subtopics: formData.subtopics.trim(),
      previousLecture: formData.previousLecture.trim(),
      duration: formData.duration,
      specialRequirements: formData.specialRequirements.trim(),
      professorName: formData.professorName.trim(),
      qualification: formData.qualification.trim(),
      instructorImage: formData.imageBase64 || undefined,
      batchCode: formData.batchCode.trim(),
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/generate-ppt`, payload, {
        responseType: 'blob',
        timeout: 180000
      });
      
      setDownloadBlob(res.data);
      setGenerationHistory(prev => [...prev, {
        subject: formData.subject,
        topics: formData.topics,
        duration: formData.duration,
        timestamp: new Date().toLocaleString(),
      }]);
      setCurrentView('completed');
    } catch (err) {
      console.error('Error generating presentation:', err);
      let errorMsg = 'Failed to generate presentation. Please try again.';
      if (err.response?.data) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.error) errorMsg = parsed.error;
        } catch (_) { /* keep default */ }
      }
      toast.error(errorMsg, 8000);
      setCurrentView('form');
    }
  };

  const handleDownload = () => {
    if (!downloadBlob) return;
    const url = window.URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${formData.subject || 'Lecture'}_lecture.pptx`.replace(/\s+/g, '_')
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Presentation downloaded successfully!');
  };

  const isGenerateDisabled = !formData.subject.trim() || !formData.topics.trim();

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="main-content-area">
        <Topbar professorName={formData.professorName} darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <div className="main-content-inner">
          {currentView === 'dashboard' && (
            <DashboardView setCurrentView={setCurrentView} generationHistory={generationHistory} />
          )}

          {currentView === 'form' && (
            <NewGenerationView 
              formData={formData}
              setFormData={setFormData}
              handleImageUpload={handleImageUpload}
              onGenerate={handleGenerate}
              subjects={SUBJECTS}
              durationOptions={durationOptions}
              isGenerateDisabled={isGenerateDisabled}
            />
          )}

          {currentView === 'generating' && (
            <SynthesizingView formData={formData} />
          )}

          {currentView === 'completed' && (
            <CompletedView 
              formData={formData} 
              handleDownload={handleDownload} 
              setCurrentView={setCurrentView} 
            />
          )}

          {currentView === 'history' && (
            <HistoryView 
              generationHistory={generationHistory}
              setCurrentView={setCurrentView}
              setFormData={setFormData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
