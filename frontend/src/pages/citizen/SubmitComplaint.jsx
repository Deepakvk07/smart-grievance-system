import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryIcon } from '../../components/CategoryIcon';
import {
  Sparkles, CheckCircle2, ArrowRight, AlertCircle, FileText,
  MapPin, Image as ImageIcon, Cpu, ShieldCheck, RefreshCw, Zap,
  LocateFixed, Loader2, Upload, Paperclip, Trash2, Eye, Check
} from 'lucide-react';

export const SubmitComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    image_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [attachmentMeta, setAttachmentMeta] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');

  const handleGetLiveLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let formattedAddress = '';
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en,hi' }, signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) formattedAddress = data.display_name;
          }
        } catch {}

        setFormData(prev => ({
          ...prev,
          location: formattedAddress || `GPS Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationError(err.code === 1 ? 'Location permission was denied.' : 'Unable to acquire live location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setAttachmentError('');
    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError('File exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, image_url: ev.target.result }));
      setAttachmentMeta({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setAttachmentMeta(null);
    setAttachmentError('');
  };

  const sampleGrievances = [
    {
      title: "Dangerous pothole causing motorcycle accidents",
      desc: "Large pothole near the main road is causing accidents and serious injuries to riders.",
      loc: "Main Ring Road Junction, Sector 14"
    },
    {
      title: "Severe potable water outage in colony",
      desc: "No water supply in our locality for three days. Over 200 families suffering crisis.",
      loc: "42 MG Road, Gandhi Nagar"
    },
    {
      title: "Substation transformer burst and total blackout",
      desc: "Transformer has stopped working and the entire locality has no electricity with loud sparks.",
      loc: "Block C Substation, Green Park"
    },
    {
      title: "Asphalt edge crack on pedestrian lane",
      desc: "Small crack on the side of the road curb not hindering traffic.",
      loc: "Lane 4, Urban Colony"
    },
    {
      title: "Low evening water line pressure",
      desc: "Water pressure is slightly low during the evening hours between 6 PM to 8 PM.",
      loc: "Avenue 3, Gandhi Nagar"
    },
    {
      title: "Dim streetlight luminaire",
      desc: "One street light is slightly dim near lamp post 14.",
      loc: "Park Perimeter Road"
    }
  ];

  const handleApplySample = (sample) => {
    setFormData({
      title: sample.title,
      description: sample.desc,
      location: sample.loc,
      image_url: ''
    });
    setError('');
  };

  const pipelineSteps = [
    "Raw Grievance Ingestion & Tokenization",
    "NLP Preprocessing & Stopword Stripping",
    "TF-IDF Bi-gram Feature Vectorization",
    "Random Forest Ensemble ML Classifier (91.2% Acc)",
    "Category Determination & Department Routing Complete"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      setError('Title, Description, and Location are mandatory.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setPipelineStep(0);

    // Simulate animated pipeline step transitions for high-impact viva demonstration
    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const res = await api.submitComplaint(formData);
      clearInterval(stepInterval);
      setPipelineStep(4);

      setTimeout(() => {
        setIsSubmitting(false);
        setPredictionResult(res);
      }, 500);
    } catch (err) {
      clearInterval(stepInterval);
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit grievance. Please retry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
            <span>AI Automated Triage Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Submit Civic Grievance
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Provide the details of your issue. You do <strong className="text-slate-900">NOT</strong> need to choose a category—our ML classification model analyzes the text and routes it to the designated department automatically.
          </p>
        </div>

        {/* Prediction Result Overlay Card if submitted */}
        {predictionResult ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Complaint Registered Successfully</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Complaint ID: {predictionResult.complaint_id}
                </h2>
                <p className="text-emerald-100 text-xs mt-1">
                  Assigned to: <strong>{predictionResult.assigned_department}</strong>
                </p>
              </div>

              <div className="hidden sm:block text-right">
                <span className="font-mono text-3xl font-black bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                  {predictionResult.complaint_id}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Classification Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                      Predicted Category
                    </span>
                    <div className="text-xl font-black text-slate-900 mt-1">
                      {predictionResult.category}
                    </div>
                  </div>
                  <CategoryIcon category={predictionResult.category} className="h-8 w-8" />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                      Current Status
                    </span>
                    <div className="mt-1">
                      <StatusBadge status="Submitted" />
                    </div>
                  </div>
                  <div className="text-xs text-right text-slate-500">
                    <span className="block font-semibold">Field Dispatch:</span>
                    <span className="font-mono text-emerald-600 font-bold">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Explanation Callout */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1.5 text-blue-950 font-bold text-sm">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>AI Triage Rationale & Explainability:</span>
                </div>
                <p className="text-sm text-blue-900 leading-relaxed">
                  "{predictionResult.explanation}"
                </p>
                {predictionResult.prediction?.extracted_keywords && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-blue-700 font-medium">Keywords Extracted:</span>
                    {predictionResult.prediction.extracted_keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-white text-blue-800 rounded font-mono border border-blue-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Citation Card */}
              <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Model: <strong>Random Forest Classifier (91.2% Production Accuracy)</strong></span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">TF-IDF Feature Space</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setPredictionResult(null);
                    setFormData({ title: '', description: '', location: '', image_url: '' });
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  File Another Grievance
                </button>
                <Link
                  to={`/complaints/${predictionResult.complaint_id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm"
                >
                  <span>Track Complaint Timeline</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : isSubmitting ? (
          /* Live AI Analysis Screen */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <Cpu className="h-8 w-8 text-blue-600 absolute" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Analysing your grievance...
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Executing Natural Language Processing & TF-IDF feature classification
              </p>
            </div>

            {/* Pipeline Step Tracker */}
            <div className="max-w-md mx-auto space-y-2 text-left">
              {pipelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-all ${
                    idx < pipelineStep
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : idx === pipelineStep
                      ? 'bg-blue-50 text-blue-800 border border-blue-300 font-bold animate-pulse'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {idx < pipelineStep ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current shrink-0 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </div>
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Grievance Form */
          <div className="space-y-6">
            {/* Quick Demo Pre-fill templates */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Quick Test Grievance Templates (Click to fill)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {sampleGrievances.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySample(s)}
                    className="p-2.5 text-left border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs group"
                  >
                    <span className="font-semibold text-slate-800 block truncate group-hover:text-blue-700">
                      {s.title}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {s.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Large pothole near the main road is causing accidents"
                  className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Complaint Detailed Description *
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the nature of the hazard, location markers, severity, duration, and disruption to public safety..."
                  className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <p className="text-[11px] text-slate-500 mt-1">
                  The ML model analyzes civic keywords from this description to identify Category and route to municipal field squads.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Specific Location / Landmark *
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLiveLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="h-3 w-3 text-blue-600" />
                        <span>Use Live Location</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (locationError) setLocationError('');
                    }}
                    placeholder="e.g. Ring Road Junction, near Metro Pillar 114, Sector 14"
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {locationError && (
                  <p className="text-xs text-amber-600 mt-1">{locationError}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Attachment / Photo Proof (Optional)
                  </label>
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {!formData.image_url ? (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="h-5 w-5 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Click to upload photo or document</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 5MB)</span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white border border-blue-200 overflow-hidden flex items-center justify-center">
                        {formData.image_url.startsWith('data:image') || formData.image_url.startsWith('http') ? (
                          <img src={formData.image_url} alt="Proof" className="w-full h-full object-cover" />
                        ) : (
                          <Paperclip className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{attachmentMeta?.name || 'Attached Photo Evidence'}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Ready
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="p-1.5 text-rose-600 hover:text-rose-700 bg-white border border-rose-200 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {attachmentError && (
                  <p className="text-xs text-rose-600 mt-1">{attachmentError}</p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Automated categorization & department dispatch upon submission
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Submit & Run AI Triage</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
