import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryIcon } from '../../components/CategoryIcon';
import {
  FileText, Clock, CheckCircle2, AlertTriangle,
  ArrowRight, MapPin, Send, Loader2, Search, CheckCircle,
  PlusCircle, X, Zap, Droplets, Construction, ShieldCheck, Check,
  PhoneCall, HelpCircle, AlertCircle, Info, ChevronDown,
  Shield, Users, ChevronRight, Activity, Eye, LocateFixed,
  Paperclip, Upload, Trash2, Bot, User, Phone, Building2
} from 'lucide-react';

export const CitizenDashboard = () => {
  const navigate = useNavigate();

  // Modal Open/Close State
  const [modalOpen, setModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    title: '',
    description: '',
    location: '',
    image_url: ''
  });
  const [attachmentMeta, setAttachmentMeta] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState('');

  // Automatic Civic Address Breakdown State
  const [addressBreakdown, setAddressBreakdown] = useState(null); // { society, road, colony, city, pincode, state, accuracy, lat, lon }

  // Track State
  const [trackId, setTrackId] = useState('');
  const [trackError, setTrackError] = useState('');

  // FAQ Accordion State & Category Filter
  const [openFaq, setOpenFaq] = useState(0);
  const [faqCategory, setFaqCategory] = useState('all');

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSubmitSuccess(null);
    setSubmitError('');
    setLocationError('');
    setLocationSuccess('');
    setIsLocating(false);
    setAttachmentError('');
    setAttachmentMeta(null);
    setAddressBreakdown(null);
    setFormData({
      name: '',
      mobile: '',
      title: '',
      description: '',
      location: '',
      image_url: ''
    });
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        callback(compressedDataUrl);
      };
      img.onerror = () => {
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setAttachmentError('Failed to read file. / फ़ाइल पढ़ने में विफल।');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setAttachmentError('');
    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError('File exceeds 5MB limit. Please upload a smaller photo. / फ़ाइल 5MB से बड़ी है।');
      return;
    }

    if (file.type.startsWith('image/')) {
      compressImage(file, (dataUrl) => {
        setFormData(prev => ({ ...prev, image_url: dataUrl }));
        setAttachmentMeta({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });
      });
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, image_url: ev.target.result }));
        setAttachmentMeta({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setAttachmentMeta(null);
    setAttachmentError('');
  };

  const handleGetLiveLocation = () => {
    setLocationError('');
    setLocationSuccess('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. / आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता।');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const freshCoords = {
          lat: Number(latitude.toFixed(6)),
          lon: Number(longitude.toFixed(6)),
          accuracy: Math.round(accuracy || 0)
        };

        try {
          // Call our reliable backend geocoding service with official municipal user-agent
          const res = await api.reverseGeocode(freshCoords.lat, freshCoords.lon);
          if (res.success && res.formatted_address) {
            setFormData(prev => ({ ...prev, location: res.formatted_address }));
            setAddressBreakdown({
              society: res.society || '',
              road: res.road || '',
              colony: res.colony || '',
              city: res.city ? `${res.city}${res.pincode ? ` - ${res.pincode}` : ''}` : (res.pincode || ''),
              pincode: res.pincode || '',
              state: res.state || '',
              accuracy: freshCoords.accuracy,
              lat: freshCoords.lat,
              lon: freshCoords.lon,
              suggestions: res.suggestions || []
            });

            const accText = freshCoords.accuracy <= 50
              ? `🎯 Exact spot auto-detected (±${freshCoords.accuracy}m accuracy)`
              : `📡 Area detected: ${res.colony || 'Civic Zone'} (±${freshCoords.accuracy}m) • You can fine-tune Society or Road below`;
            setLocationSuccess(accText);
          } else {
            const fallbackLoc = `GPS Coordinates (${freshCoords.lat}, ${freshCoords.lon})`;
            setFormData(prev => ({ ...prev, location: fallbackLoc }));
            setAddressBreakdown({
              society: '',
              road: '',
              colony: '',
              city: '',
              pincode: '',
              state: '',
              accuracy: freshCoords.accuracy,
              lat: freshCoords.lat,
              lon: freshCoords.lon,
              suggestions: []
            });
            setLocationSuccess('Coordinates captured via device GPS.');
          }
        } catch {
          const fallbackLoc = `GPS Coordinates (${freshCoords.lat}, ${freshCoords.lon})`;
          setFormData(prev => ({ ...prev, location: fallbackLoc }));
          setLocationSuccess('Coordinates captured via device GPS.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Unable to fetch your live location. / लाइव लोकेशन प्राप्त करने में विफल।';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser settings. / लोकेशन की अनुमति अस्वीकृत।';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'GPS signal unavailable. Please ensure location services are turned on. / लोकेशन सिग्नल उपलब्ध नहीं है।';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please click "Use Live Location" again. / समय समाप्त हुआ। पुनः प्रयास करें।';
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh satellite/WiFi triangulation
      }
    );
  };

  const handleUpdateBreakdown = (field, value) => {
    setAddressBreakdown(prev => {
      const updated = { ...(prev || {}), [field]: value };
      const parts = [];
      if (updated.society?.trim()) parts.push(updated.society.trim());
      if (updated.road?.trim()) parts.push(updated.road.trim());
      if (updated.colony?.trim()) parts.push(updated.colony.trim());
      if (updated.city?.trim()) parts.push(updated.city.trim());

      setFormData(f => ({ ...f, location: parts.join(', ') }));
      return updated;
    });
  };

  const handleAddSuggestion = (sug) => {
    if (!sug || !sug.trim()) return;
    const clean = sug.trim();
    setAddressBreakdown(prev => {
      const current = prev || { society: '', road: '', colony: '', city: '', suggestions: [] };
      const updated = { ...current };

      const lower = clean.toLowerCase();
      if (lower.includes('road') || lower.includes('marg') || lower.includes('street') || lower.includes('lane') || lower.includes('way') || lower.includes('flyover')) {
        updated.road = clean;
      } else if (!updated.society) {
        updated.society = clean;
      } else if (!updated.colony.toLowerCase().includes(lower)) {
        updated.colony = updated.colony ? `${clean}, ${updated.colony}` : clean;
      } else {
        updated.society = `${clean}, ${updated.society}`;
      }

      const parts = [];
      if (updated.society?.trim()) parts.push(updated.society.trim());
      if (updated.road?.trim()) parts.push(updated.road.trim());
      if (updated.colony?.trim()) parts.push(updated.colony.trim());
      if (updated.city?.trim()) parts.push(updated.city.trim());

      setFormData(f => ({ ...f, location: parts.join(', ') }));
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      setSubmitError('Please enter your Name and 10-digit Mobile Number / कृपया अपना नाम एवं 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    if (formData.mobile.trim().length < 10) {
      setSubmitError('Please enter a valid 10-digit Mobile Number / कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setSubmitError('Please complete all required fields. / कृपया सभी आवश्यक जानकारी भरें।');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const res = await api.submitComplaint({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        image_url: formData.image_url || ''
      });
      setIsSubmitting(false);
      setSubmitSuccess(res);
      setFormData({
        name: '',
        mobile: '',
        title: '',
        description: '',
        location: '',
        image_url: ''
      });
      setAttachmentMeta(null);
      setAttachmentError('');
      setLocationError('');
      setLocationSuccess('');
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Submission failed. Please try again. / शिकायत दर्ज करने में विफल। पुनः प्रयास करें।');
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const cleanId = trackId.trim();
    if (!cleanId) {
      setTrackError('Please enter a valid Complaint ID (e.g. GRV-1001) / कृपया सही शिकायत संख्या दर्ज करें');
      return;
    }
    setTrackError('');
    navigate(`/complaints/${cleanId}`);
  };

  const citizenGuidelines = [
    {
      num: '01',
      titleEn: 'Give Exact Landmarks',
      titleHi: 'सटीक लैंडमार्क की जानकारी दें',
      descEn: 'Mention nearby recognizable spots such as schools, temples, metro pillars, or shop numbers so the field vehicle reaches directly without delay.',
      descHi: 'स्कूल, मंदिर, मेट्रो पिलर या दुकान नंबर जैसे प्रमुख लैंडमार्क बताएं ताकि फील्ड टीम बिना भटके सीधे मौके पर पहुंच सके।',
      gradient: 'from-blue-600 to-indigo-600',
      borderColor: 'group-hover:border-blue-400'
    },
    {
      num: '02',
      titleEn: 'Highlight Safety Hazards',
      titleHi: 'सुरक्षा से जुड़े खतरों का उल्लेख करें',
      descEn: 'If open manholes, sparking cables, or deep road cracks pose immediate danger to pedestrians or two-wheelers, clearly state it in the description.',
      descHi: 'यदि खुले सीवर, लटकते तार या गहरे गड्ढे से राहगीरों या वाहनों को खतरा है, तो विवरण में स्पष्ट रूप से अवश्य लिखें।',
      gradient: 'from-amber-500 to-orange-500',
      borderColor: 'group-hover:border-amber-400'
    },
    {
      num: '03',
      titleEn: 'Save Your Complaint ID',
      titleHi: 'अपनी शिकायत संख्या सुरक्षित रखें',
      descEn: 'Keep your unique tracking ID (e.g. GRV-1002) safe. It is required to check live status or speak with your ward engineer during inspection.',
      descHi: 'अपनी ट्रैकिंग आईडी (उदा. GRV-1002) सुरक्षित रखें। स्थिति जांचने या वार्ड इंजीनियर से संपर्क करने के लिए इसकी आवश्यकता होगी।',
      gradient: 'from-emerald-500 to-teal-500',
      borderColor: 'group-hover:border-emerald-400'
    },
    {
      num: '04',
      titleEn: 'Avoid Duplicate Submissions',
      titleHi: 'एक ही समस्या दोबारा दर्ज न करें',
      descEn: 'Filing multiple complaints for the same spot creates backlog. Use the search bar above anytime to see existing status and updates.',
      descHi: 'एक ही जगह की कई शिकायतें दर्ज करने से देरी होती है। अपनी शिकायत की स्थिति देखने के लिए ऊपर दिए गए सर्च बार का उपयोग करें।',
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'group-hover:border-purple-400'
    }
  ];

  const faqCategories = [
    { id: 'all', nameEn: 'All Questions', nameHi: 'सभी प्रश्न', count: 8 },
    { id: 'timeline', nameEn: 'Timelines & Inspection', nameHi: 'समय-सीमा एवं निरीक्षण', count: 2 },
    { id: 'tracking', nameEn: 'Tracking & Verification', nameHi: 'ट्रैकिंग एवं सत्यापन', count: 3 },
    { id: 'rules', nameEn: 'Rules & Coordination', nameHi: 'नियम एवं समन्वय', count: 3 }
  ];

  const faqs = [
    {
      category: 'timeline',
      tagEn: 'TIMELINES',
      tagHi: 'समय-सीमा',
      qEn: 'How long does it take for municipal teams to inspect and resolve a complaint?',
      qHi: 'शिकायत दर्ज होने के बाद नगर निगम की टीम कितने समय में निरीक्षण एवं समाधान करती है?',
      aEn: 'High-urgency safety hazards (such as live dangling wires, deep road cave-ins, or major main pipe bursts) are inspected by the ward field unit within 24 to 48 hours. Routine civil maintenance works (such as pothole resurfacing or storm drain desilting) are scheduled according to ward work cycles and typically completed within 3 to 7 working days.',
      aHi: 'गंभीर और सुरक्षा से जुड़े मामलों (जैसे लटकते बिजली के तार, सड़क धंसना या मुख्य पाइपलाइन फटना) में वार्ड फील्ड यूनिट २४ से ४८ घंटे के भीतर मौके पर पहुंचकर निरीक्षण करती है। सामान्य रखरखाव कार्य (जैसे गड्ढों की पैचिंग या नाली की सफाई) वार्ड कार्य-तालिका के अनुसार ३ से ७ कार्य दिवसों में पूरे किए जाते हैं।'
    },
    {
      category: 'tracking',
      tagEn: 'TRACKING',
      tagHi: 'ट्रैकिंग',
      qEn: 'Can I check my complaint status without logging into my account?',
      qHi: 'क्या मैं बिना लॉगिन किए अपनी शिकायत की प्रगति एवं स्थिति देख सकता हूं?',
      aEn: 'Yes! Anyone can enter their unique Grievance Tracking ID (e.g. GRV-1001) in the tracking bar on this portal to see real-time inspection progress, the assigned municipal division, and engineer remarks without logging in. You can also share the tracking link with neighbors to follow updates together.',
      aHi: 'हाँ! कोई भी नागरिक इस पोर्टल पर दिए गए सर्च बार में अपनी शिकायत संख्या (उदा. GRV-1001) दर्ज करके बिना लॉगिन किए वर्तमान स्थिति, संबंधित नगर निगम प्रभाग और अधिकारियों की टिप्पणी देख सकता है। आप अपने पड़ोसियों के साथ भी यह ट्रैकिंग संख्या साझा कर सकते हैं।'
    },
    {
      category: 'tracking',
      tagEn: 'VERIFICATION',
      tagHi: 'सत्यापन',
      qEn: 'What happens once the ground repair work is completed on site?',
      qHi: 'स्थल पर मरम्मत कार्य पूरा होने के बाद क्या प्रक्रिया होती है?',
      aEn: 'Once the maintenance crew finishes the work, the Junior Engineer (JE) of the respective ward conducts an on-site verification, records official completion remarks in the municipal portal, and updates the status to "Resolved". The complete record with timestamp remains permanently viewable in your complaint history.',
      aHi: 'मरम्मत कार्य पूरा होने पर संबंधित वार्ड के जूनियर इंजीनियर (JE) मौके पर कार्य का सत्यापन करते हैं, नगर निगम पोर्टल पर आधिकारिक टिप्पणी दर्ज करते हैं और स्थिति को "समाधान (Resolved)" में अपडेट करते हैं। यह पूरा विवरण टाइमस्टैम्प सहित आपकी शिकायत हिस्ट्री में सुरक्षित रहता है।'
    },
    {
      category: 'rules',
      tagEn: 'ESCALATION',
      tagHi: 'पुनः जांच',
      qEn: 'What should I do if the issue is marked resolved but is still not properly fixed?',
      qHi: 'यदि शिकायत को हल (Resolved) दिखाया गया है परंतु कार्य ठीक से नहीं हुआ, तो क्या करें?',
      aEn: 'If a repair was incomplete, substandard, or reoccurred within a few days, you can contact the Ward Maintenance Supervisor directly using your Complaint ID as a reference, or file an appeal request through the portal helpline for secondary inspection.',
      aHi: 'यदि कार्य अधूरा रहा, गुणवत्ता ठीक नहीं थी, या कुछ ही दिनों में समस्या पुनः उत्पन्न हो गई, तो आप अपनी शिकायत संख्या (Grievance ID) का संदर्भ देकर वार्ड अनुरक्षण पर्यवेक्षक से संपर्क कर सकते हैं या पुनः निरीक्षण हेतु अपील दर्ज करा सकते हैं।'
    },
    {
      category: 'timeline',
      tagEn: 'EMERGENCY',
      tagHi: 'आपातकालीन',
      qEn: 'What should I do in case of an immediate life-threatening civic hazard?',
      qHi: 'यदि कोई तत्काल जीवन-घातक या गंभीर खतरा हो तो क्या करें?',
      aEn: 'For active electrical short-circuits, transformer fires, or major road cave-ins requiring immediate barricading, do not wait in routine queues. Call the 24x7 Emergency Control Room helpline immediately at 1800-11-2233 or 1912 for rapid emergency dispatch.',
      aHi: 'बिजली के तारों में आग, ट्रांसफार्मर में शॉर्ट-सर्किट या बड़े सड़क धंसने जैसी गंभीर आपात स्थिति में पोर्टल कतार की प्रतीक्षा न करें। त्वरित आपातकालीन वैन के लिए तुरंत २४x७ कंट्रोल रूम नंबर १८००-११-२२३३ या १९१२ पर कॉल करें।'
    },
    {
      category: 'rules',
      tagEn: 'LANDMARKS',
      tagHi: 'लैंडमार्क',
      qEn: 'Why is providing a prominent nearby landmark mandatory while reporting?',
      qHi: 'शिकायत दर्ज करते समय प्रमुख लैंडमार्क (Landmark) देना क्यों अनिवार्य है?',
      aEn: 'Municipal maintenance vans navigate dense urban sectors. Providing recognizable landmarks like metro pillars, pole numbers, temples, or prominent school gates ensures the repair van arrives at the exact spot without calling or getting delayed in traffic.',
      aHi: 'नगर निगम के भारी मरम्मत वाहन घने शहरी क्षेत्रों में जाते हैं। मेट्रो पिलर, खंभा नंबर, मंदिर या स्कूल जैसे प्रमुख लैंडमार्क होने से फील्ड टीम बिना भटके सीधे मौके पर पहुंचकर काम शुरू कर सकती है।'
    },
    {
      category: 'rules',
      tagEn: 'COORDINATION',
      tagHi: 'समन्वय',
      qEn: 'What happens when an issue involves multiple departments (e.g. road digging for pipe leaks)?',
      qHi: 'यदि किसी समस्या में एक से अधिक विभाग शामिल हों (जैसे पानी की पाइपलाइन हेतु सड़क खुदाई)?',
      aEn: 'In cross-departmental cases, the primary department (e.g. Water Board) completes the pipeline repair first, and coordinates an inter-departmental work order with the Civil Road Division for asphalt resurfacing and road leveling.',
      aHi: 'ऐसे मामलों में प्राथमिक विभाग (जैसे जल बोर्ड) पहले पाइपलाइन की मरम्मत पूरी करता है, जिसके उपरांत सड़क विभाग द्वारा डामरीकरण एवं समतलीकरण कार्य संपन्न किया जाता है।'
    },
    {
      category: 'tracking',
      tagEn: 'FEEDBACK',
      tagHi: 'प्रतिक्रिया',
      qEn: 'Can citizens provide feedback or ratings on the quality of municipal work?',
      qHi: 'कार्य पूरा होने के बाद क्या नागरिक अपनी प्रतिक्रिया या रेटिंग दे सकते हैं?',
      aEn: 'Yes! After a grievance is marked "Resolved", citizens can review the official resolution remarks on the live tracking page and submit feedback regarding the repair quality, timeliness, and field crew response.',
      aHi: 'हाँ! शिकायत के समाधान (Resolved) के बाद नागरिक ट्रैकिंग पेज पर जाकर आधिकारिक टिप्पणी देख सकते हैं और कार्य की गुणवत्ता तथा समयबद्धता पर अपनी प्रतिक्रिया दर्ज कर सकते हैं।'
    }
  ];

  const filteredFaqs = faqs.filter(f => {
    const matchesCat = faqCategory === 'all' || f.category === faqCategory;
    if (!matchesCat) return false;
    if (!faqSearchQuery.trim()) return true;
    const q = faqSearchQuery.toLowerCase();
    return (
      f.qEn.toLowerCase().includes(q) ||
      f.qHi.toLowerCase().includes(q) ||
      f.aEn.toLowerCase().includes(q) ||
      f.aHi.toLowerCase().includes(q) ||
      f.tagEn.toLowerCase().includes(q) ||
      f.tagHi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* 0. TOP CIVIC TRICOLOR STRIPE */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      {/* TOP WHITE CIVIC BANNER: SIGNIFYING SMART GRIEVANCE SYSTEM */}
      <header className="w-full bg-white border-b border-slate-200 shadow-2xs py-4 px-4 sm:px-8 lg:px-12 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Official Smart Civic Portal Emblem & Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-md shadow-blue-950/10 border border-slate-200 shrink-0 flex items-center justify-center transition-transform hover:scale-105 overflow-hidden group">
              <img
                src="/images/grievance_logo.png"
                alt="Smart Grievance System Official Municipal Emblem"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Smart Grievance System
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100/80 text-blue-800 border border-blue-200">
                  Official Portal
                </span>
              </div>
              <p className="font-hindi text-xs sm:text-[13px] font-bold text-blue-950">
                स्मार्ट जन-शिकायत निवारण एवं त्वरित नागरिक सेवा पोर्टल
              </p>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Centralized Municipal Grievance Redressal & Rapid Ground Response
              </p>
            </div>
          </div>

          {/* Right: Helpline & Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-start md:self-auto">
            {/* Toll Free Helpline */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <PhoneCall className="h-3.5 w-3.5" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">24x7 Helpline</span>
                <span className="font-mono font-bold text-slate-800 text-xs">1800-120-2026 / 1916</span>
              </div>
            </div>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Portal Live 24x7</span>
            </div>

            {/* Question Symbol Button: Opens FAQ Modal */}
            <button
              type="button"
              onClick={() => setFaqModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
              title="Frequently Asked Questions (FAQ) & Help • अक्सर पूछे जाने वाले प्रश्न"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 transition-transform">
                ?
              </div>
              <span className="font-bold">FAQ & Help</span>
              <span className="font-hindi font-normal text-[11px] text-slate-500 group-hover:text-blue-600 hidden md:inline">(सहायता)</span>
            </button>

            {/* Direct Register Button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register Grievance</span>
              <span className="font-hindi font-normal text-[11px] hidden sm:inline">(शिकायत दर्ज करें)</span>
            </button>

            {/* Official Admin Login Button */}
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 group"
              title="Official Municipal Administration Console / अधिकारी लॉगिन"
            >
              <Shield className="h-3.5 w-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Admin Login</span>
              <span className="font-hindi font-normal text-[10px] text-slate-300 hidden lg:inline">(अधिकारी)</span>
            </Link>
          </div>

        </div>
      </header>

      {/* 1. HERO BANNER: Full-Bleed 100% Width with Illuminated Civic Palette, Images & Feature Cards */}
      <section className="w-full bg-gradient-to-br from-slate-900 via-blue-900/95 to-indigo-950 text-white py-12 sm:py-20 px-6 sm:px-12 lg:px-20 border-b border-blue-800/40 relative overflow-hidden">
        
        {/* Ambient Glowing Orbs with Smooth Shifting Aurora Animation */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-aurora"></div>
        <div className="absolute -bottom-24 right-10 w-[450px] h-[450px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none animate-aurora"></div>
        <div className="absolute inset-0 bg-grid-subtle opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Main 2-Column Responsive Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headings, Bilingual Copy, and Action Buttons (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left animate-fade-in-up">
              
              {/* Top Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-200 backdrop-blur-md shadow-xs animate-levitate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
                <span>City Public Grievance Portal</span>
                <span className="text-blue-400/60">•</span>
                <span className="font-hindi text-blue-100">नगर नागरिक जन-शिकायत पोर्टल</span>
              </div>

              {/* Bilingual Main Heading */}
              <div className="space-y-2.5">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.12]">
                  City Civic Grievance & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-200">
                    Public Redressal Portal
                  </span>
                </h1>
                <p className="font-hindi text-lg sm:text-xl lg:text-2xl font-bold text-sky-200 leading-snug">
                  नागरिक शिकायत पंजीकरण एवं सार्वजनिक समस्या समाधान पोर्टल
                </p>
              </div>

              {/* Bilingual Description */}
              <div className="space-y-1.5 text-slate-300 max-w-2xl text-xs sm:text-sm sm:leading-relaxed">
                <p>
                  Report broken roads, water leakages, choked drainage, or dark streetlights directly to the municipal department for rapid ground inspection and repair.
                </p>
                <p className="font-hindi text-slate-400 text-xs sm:text-[13px] leading-relaxed">
                  अपने इलाके की टूटी सड़कें, पानी की लीकेज, बंद नालियां या खराब स्ट्रीट लाइट की सूचना सीधे नगर निगम को दें। आपकी शिकायत त्वरित निरीक्षण एवं समाधान हेतु प्रेषित की जाती है।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-shimmer px-6 sm:px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/35 flex items-center gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 group"
                >
                  <PlusCircle className="h-5 w-5 text-blue-200 group-hover:text-white transition-colors" />
                  <span>File a Complaint Online</span>
                  <span className="font-hindi text-xs font-normal text-blue-100">(शिकायत दर्ज करें)</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#check-status"
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white font-semibold text-xs sm:text-sm rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <Search className="h-4 w-4 text-sky-300" />
                  <span>Track Status</span>
                  <span className="font-hindi text-xs font-normal text-slate-300">(स्थिति जांचें)</span>
                </a>
              </div>

              {/* Live Trust Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs transition-transform hover:scale-105">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Smart AI Redressal</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs transition-transform hover:scale-105">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  <span>GPS Geo-Tagging</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs transition-transform hover:scale-105">
                  <ShieldCheck className="h-3 w-3 text-sky-400" />
                  <span>100% Transparent</span>
                </div>
              </div>

            </div>

            {/* Right Column: High-Impact Civic Images Showcase (5 cols) */}
            <div className="lg:col-span-5 relative animate-fade-in-up">
              
              {/* Featured Card: Road & Pothole Repair */}
              <div className="image-zoom-container glass-card-hover relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-blue-950/80 group">
                <img
                  src="/images/road_repair.jpg"
                  alt="Road and Infrastructure Maintenance"
                  className="w-full h-52 sm:h-60 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
                
                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
                    <Construction className="h-3.5 w-3.5 text-amber-400" />
                    <span>Roads & Potholes (सड़क व गड्ढे)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold shadow-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>24h Triage</span>
                  </span>
                </div>

                {/* Bottom Content on Image */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-0.5 text-left">
                  <div className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    Road Surface & Pothole Restoration
                  </div>
                  <p className="font-hindi text-xs text-slate-300">
                    वार्ड फील्ड टीमों द्वारा त्वरित सड़क पैचवर्क व मरम्मत
                  </p>
                </div>
              </div>

              {/* 2 Paired Sub-Image Cards */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                
                {/* Sub-Card 1: Water Supply */}
                <div className="image-zoom-container glass-card-hover relative rounded-2xl overflow-hidden border border-white/15 shadow-xl group">
                  <img
                    src="/images/water_supply.jpg"
                    alt="Water Supply and Pipeline"
                    className="w-full h-28 sm:h-32 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/80 border border-blue-400/30 text-[10px] font-bold text-blue-200 backdrop-blur-xs">
                      <Droplets className="h-2.5 w-2.5 text-blue-300" />
                      <span>Water (पेयजल)</span>
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <span className="text-xs font-bold text-white block truncate">Pipeline & Leakage Fix</span>
                    <span className="font-hindi text-[10px] text-slate-300 block truncate">सीवर व पाइपलाइन</span>
                  </div>
                </div>

                {/* Sub-Card 2: Streetlights */}
                <div className="image-zoom-container glass-card-hover relative rounded-2xl overflow-hidden border border-white/15 shadow-xl group">
                  <img
                    src="/images/streetlights.jpg"
                    alt="Smart Streetlights and Electrical"
                    className="w-full h-28 sm:h-32 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-900/80 border border-yellow-400/30 text-[10px] font-bold text-yellow-200 backdrop-blur-xs">
                      <Zap className="h-2.5 w-2.5 text-yellow-300" />
                      <span>Lighting (बिजली)</span>
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <span className="text-xs font-bold text-white block truncate">Smart Streetlights</span>
                    <span className="font-hindi text-[10px] text-slate-300 block truncate">स्ट्रीट लाइट सुधार</span>
                  </div>
                </div>

              </div>

              {/* Floating Civic Badge with Levitation Animation */}
              <div className="absolute -bottom-3 -left-2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-white/20 shadow-2xl backdrop-blur-md animate-levitate-reverse">
                <img
                  src="/images/civic_teams.jpg"
                  alt="Municipal Teams"
                  className="w-7 h-7 rounded-lg object-cover border border-emerald-400"
                />
                <div className="text-left">
                  <div className="text-[11px] font-extrabold text-white leading-tight">48 Ward Field Units</div>
                  <div className="font-hindi text-[10px] text-emerald-400">सक्रिय फील्ड टीमें तैनात</div>
                </div>
              </div>

            </div>

          </div>

          {/* 4 Hero Sub-Boxes: Modern Frosted Glass Cards with Hover Shine */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            
            <div className="glass-card-hover bg-white/10 backdrop-blur-md border border-white/15 hover:border-blue-400/50 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Round the Clock</span>
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 group-hover:rotate-12 transition-transform">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">24x7 Digital Service</span>
              <span className="font-hindi text-xs text-slate-300 block">२४x७ डिजिटल सेवा</span>
            </div>

            <div className="glass-card-hover bg-white/10 backdrop-blur-md border border-white/15 hover:border-emerald-400/50 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Complete Coverage</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">All 48 City Wards</span>
              <span className="font-hindi text-xs text-slate-300 block">सभी ४८ वार्ड क्षेत्र</span>
            </div>

            <div className="glass-card-hover bg-white/10 backdrop-blur-md border border-white/15 hover:border-amber-400/50 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Direct Action</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">Dedicated Field Teams</span>
              <span className="font-hindi text-xs text-slate-300 block">सीधी फील्ड कार्रवाई</span>
            </div>

            <div className="glass-card-hover bg-white/10 backdrop-blur-md border border-white/15 hover:border-cyan-400/50 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">Transparency</span>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">Live Status Tracking</span>
              <span className="font-hindi text-xs text-slate-300 block">लाइव ट्रैकिंग सुविधा</span>
            </div>

          </div>

        </div>
      </section>

      {/* LIVE MUNICIPAL BULLETIN TICKER RIBBON */}
      <div className="w-full bg-slate-900 border-b border-blue-900/40 text-slate-200 py-2.5 px-4 overflow-hidden relative shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center gap-2 pr-4 bg-slate-900 z-10 shrink-0 border-r border-slate-700/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Live Civic Bulletin</span>
            <span className="font-hindi text-[11px] text-slate-400 hidden sm:inline">(लाइव बुलेटिन)</span>
          </div>

          <div className="overflow-hidden flex-1 relative pl-4">
            <div className="animate-marquee whitespace-nowrap text-xs font-medium text-slate-300 flex items-center gap-8">
              <span className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                <span>वार्ड ४२: सड़क डामरीकरण व गड्ढा मरम्मत कार्य पूर्ण (Resolved)</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-blue-400">💧</span>
                <span>वार्ड १५: मुख्य पेयजल पाइपलाइन लीकेज का सफल निस्तारण</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">💡</span>
                <span>वार्ड २८: मॉडल टाउन में १२ नई स्मार्ट एलईडी लाइटें चालू</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>पिछले २४ घंटे में ६४ नागरिक समस्याओं का त्वरित समाधान</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-sky-400">🛡️</span>
                <span>९८.२% जन-संतुष्टि दर • सभी ४८ वार्ड फील्ड यूनिट्स सक्रिय</span>
              </span>

              {/* Loop Duplicate for Smooth Continuous Marquee */}
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                <span>वार्ड ४२: सड़क डामरीकरण व गड्ढा मरम्मत कार्य पूर्ण (Resolved)</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-blue-400">💧</span>
                <span>वार्ड १५: मुख्य पेयजल पाइपलाइन लीकेज का सफल निस्तारण</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">💡</span>
                <span>वार्ड २८: मॉडल टाउन में १२ नई स्मार्ट एलईडी लाइटें चालू</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>पिछले २४ घंटे में ६४ नागरिक समस्याओं का त्वरित समाधान</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-2">
                <span className="text-sky-400">🛡️</span>
                <span>९८.२% जन-संतुष्टि दर • सभी ४८ वार्ड फील्ड यूनिट्स सक्रिय</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: CHECK COMPLAINT STATUS (Full-Bleed White Band with Featured Sub-Boxes) */}
      <section id="check-status" className="w-full bg-white py-16 px-6 sm:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              <span>Live Status Lookup • लाइव स्थिति जांच</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Check Complaint Status
            </h2>
            <p className="font-hindi text-lg sm:text-xl font-bold text-slate-700">
              अपनी शिकायत की स्थिति एवं प्रगति जांचें
            </p>

            <div className="space-y-1 text-xs sm:text-sm text-slate-600 pt-1 leading-relaxed">
              <p>Have you already registered a grievance? Enter your Complaint ID below to check inspection updates, assigned field officers, and official remarks.</p>
              <p className="font-hindi text-slate-500">क्या आपने पहले शिकायत दर्ज की है? अपनी शिकायत संख्या दर्ज कर वर्तमान स्थिति, फील्ड अधिकारी और आधिकारिक टिप्पणी देखें।</p>
            </div>
          </div>

          {/* Search Sub-Box Container */}
          <div className="sub-box-card bg-slate-50/70 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 absolute top-0 left-0"></div>

            <form onSubmit={handleTrackSubmit} className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center bg-white border border-slate-300 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100 rounded-2xl px-4 py-3.5 shadow-xs transition-all">
                  <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={trackId}
                    onChange={e => setTrackId(e.target.value)}
                    placeholder="Enter Complaint ID (e.g. GRV-1001) / शिकायत संख्या दर्ज करें"
                    className="w-full text-xs sm:text-base text-slate-900 outline-none bg-transparent placeholder:text-slate-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shrink-0 transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Track Status</span>
                  <span className="font-hindi font-normal">(जांचें)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {trackError && (
                <p className="text-xs text-rose-600 font-medium pl-1">{trackError}</p>
              )}
            </form>

            {/* Quick Link Row */}
            <div className="pt-4 mt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div>
                  <span>Need immediate municipal grievance registration?</span>
                  <span className="block font-hindi text-slate-500 text-xs">क्या आप नई नागरिक शिकायत तुरंत दर्ज करना चाहते हैं?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer py-1 px-2.5 rounded-lg bg-blue-50/60 border border-blue-200/60 transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                  <span>FAQs & Help (सहायता)</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0 group cursor-pointer"
              >
                <span>File a New Grievance Online</span>
                <span className="font-hindi font-medium text-xs">(नई शिकायत दर्ज करें)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 3 Status Benefit Sub-Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="sub-box-card bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Real-Time Inspection Stage</h4>
              <p className="font-hindi text-xs font-semibold text-blue-900">रियल-टाइम निरीक्षण स्थिति</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track whether your complaint is under initial review, assigned to site engineers, or currently undergoing on-ground repair.
              </p>
            </div>

            <div className="sub-box-card bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Official Field Remarks</h4>
              <p className="font-hindi text-xs font-semibold text-emerald-900">आधिकारिक फील्ड रिपोर्ट</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Read maintenance crew notes, scheduled materials arrival dates, and verified completion remarks directly from municipal records.
              </p>
            </div>

            <div className="sub-box-card bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Direct Department Handover</h4>
              <p className="font-hindi text-xs font-semibold text-purple-900">सीधा विभाग हस्तांतरण</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero middleman delays — issues are directly linked to the specific ward division engineer responsible for the area.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SECTION: CITIZEN REPORTING GUIDELINES (Full-Bleed Slate-50 Band with 4 Sub-Boxes) */}
      <section className="w-full bg-slate-50/70 py-16 px-6 sm:px-12 lg:px-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Citizen Handbook • नागरिक मार्गदर्शिका
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Helpful Guidelines for Effective Reporting
            </h2>
            <p className="font-hindi text-lg sm:text-xl font-bold text-slate-700">
              त्वरित समाधान हेतु नागरिकों के लिए महत्वपूर्ण सुझाव
            </p>
            <div className="space-y-1 text-xs sm:text-sm text-slate-600 pt-1 leading-relaxed">
              <p>Following these simple guidelines helps the municipal crew locate and repair the issue without delays.</p>
              <p className="font-hindi text-slate-500">इन सरल बातों का ध्यान रखने से नगर निगम की टीम बिना देरी के समस्या का समाधान कर पाती है।</p>
            </div>
          </div>

          {/* 4 Interactive Guideline Sub-Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {citizenGuidelines.map((item, idx) => (
              <div
                key={idx}
                className={`sub-box-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between group ${item.borderColor}`}
              >
                <div className="space-y-4">
                  {/* Number Badge with Gradient */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} text-white font-black text-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    {item.num}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.titleEn}
                    </h3>
                    <p className="font-hindi text-xs font-bold text-blue-900">
                      {item.titleHi}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <p>{item.descEn}</p>
                    <p className="font-hindi text-slate-500 text-xs border-t border-slate-100 pt-1.5">{item.descHi}</p>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <span>Citizen Tip</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. SECTION: 24x7 EMERGENCY HELPLINES (Full-Bleed Dark Band with Glowing Glass Sub-Boxes) */}
      <section className="w-full bg-slate-950 text-white py-16 px-6 sm:px-12 lg:px-20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-800">
              Emergency & Helplines • आपातकालीन सहायता
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              24x7 Civic Emergency Contacts
            </h2>
            <p className="font-hindi text-lg sm:text-xl font-bold text-slate-300">
              २४ घंटे सक्रिय आपातकालीन नागरिक हेल्पलाइन नंबर
            </p>
            <div className="space-y-1 text-xs sm:text-sm text-slate-400 pt-1 leading-relaxed">
              <p>In case of sudden life-threatening hazards like high-voltage spark fires or major road cave-ins, call these official numbers directly:</p>
              <p className="font-hindi text-slate-400">बिजली के तारों में आग या भारी सड़क धंसने जैसे तत्काल जीवन-घातक खतरों की स्थिति में सीधे इन नंबरों पर संपर्क करें:</p>
            </div>
          </div>

          {/* 3 Dark Glass Emergency Sub-Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Helpline 1 */}
            <div className="dark-sub-box p-6 rounded-3xl space-y-3 group">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium block">City Control Room / मुख्य कंट्रोल रूम</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <PhoneCall className="h-5 w-5" />
                </div>
              </div>
              <a href="tel:1800112233" className="text-2xl sm:text-3xl font-black text-white group-hover:text-emerald-400 transition-colors block">
                1800-11-2233
              </a>
              <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
                Toll Free • २४x७ टोल फ्री
              </span>
            </div>

            {/* Helpline 2 */}
            <div className="dark-sub-box p-6 rounded-3xl space-y-3 group">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium block">Water Emergency / जल आपातकालीन हेल्पलाइन</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <PhoneCall className="h-5 w-5" />
                </div>
              </div>
              <a href="tel:01123456789" className="text-2xl sm:text-3xl font-black text-white group-hover:text-blue-400 transition-colors block">
                011-2345-6789
              </a>
              <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800/60">
                Main Line Burst • पाइपलाइन ब्रेकडाउन
              </span>
            </div>

            {/* Helpline 3 */}
            <div className="dark-sub-box p-6 rounded-3xl space-y-3 group">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium block">Electricity Helpline / विद्युत आपातकालीन सेवा</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <PhoneCall className="h-5 w-5" />
                </div>
              </div>
              <a href="tel:1912" className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-400 transition-colors block">
                1912
              </a>
              <span className="inline-block text-xs font-semibold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60">
                Live Wire Hazard • बिजली खतरा
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full bg-slate-900 text-slate-400 py-10 px-6 sm:px-12 text-center text-xs space-y-3.5">
        <div className="flex items-center justify-center gap-2.5 text-slate-200">
          <img
            src="/images/grievance_logo.png"
            alt="Smart Grievance System Official Logo"
            className="w-7 h-7 object-contain rounded-lg bg-white/10 p-0.5 border border-white/15"
          />
          <span className="font-bold text-sm text-white">Smart Grievance System</span>
        </div>
        <p>Dedicated to Prompt Municipal Public Service & Civic Infrastructure Redressal</p>
        <p className="font-hindi text-slate-500">नागरिक सेवा एवं त्वरित नगर पालिका समस्या समाधान हेतु समर्पित पोर्टल</p>
        <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <Link
            to="/admin/login"
            className="hover:text-white transition-colors inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 shadow-2xs"
          >
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span>Authorized Official / Admin Console Login</span>
          </Link>
        </div>
      </footer>

      {/* POPUP MODAL: Interactive Web Form Opened from Banner Button */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            className="sub-box-card bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Accent Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>

            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {submitSuccess ? 'Complaint Submitted' : 'File a Civic Complaint'}
                </h3>
                <p className="font-hindi text-xs sm:text-sm font-semibold text-slate-600">
                  {submitSuccess ? 'आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है' : 'नागरिक शिकायत ऑनलाइन दर्ज करें'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close / बंद करें"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
              {submitSuccess ? (
                /* Success Confirmation */
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-sm sm:text-base font-bold text-emerald-950 block">
                        Complaint Successfully Registered!
                      </span>
                      <span className="font-hindi text-xs font-semibold text-emerald-800 block">
                        आपकी शिकायत दर्ज कर ली गई है!
                      </span>
                      <p className="text-xs sm:text-sm text-emerald-900 pt-1">
                        Tracking ID: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">{submitSuccess.complaint_id}</strong>
                      </p>
                      <p className="font-hindi text-xs text-emerald-700">
                        शिकायत संख्या: <strong className="font-mono">{submitSuccess.complaint_id}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Assigned Division • प्रभाग
                      </span>
                      <CategoryIcon category={submitSuccess.category} showLabel={true} className="mx-auto" />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Current Status • वर्तमान स्थिति
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                        Submitted • दर्ज
                      </span>
                    </div>
                  </div>

                  {/* Automated AI Acknowledgment Response */}
                  <div className="p-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-sky-50/80 border border-blue-200/90 rounded-2xl flex items-start gap-3.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Municipal AI Assistant</span>
                          <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            Auto Response
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Instant Confirmation</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {submitSuccess.ai_ack_message ||
                          "Thank you for contacting our municipal redressal team. We have received your grievance and forwarded it directly to our field squad. Our team will review and work to resolve this issue as early as possible."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      to={`/complaints/${submitSuccess.complaint_id}`}
                      onClick={handleCloseModal}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Track Live Progress</span>
                      <span className="font-hindi font-normal">(स्थिति देखें)</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(null)}
                      className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                    >
                      <span>File Another</span>
                      <span className="font-hindi font-normal ml-1">(अन्य शिकायत)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {submitError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Citizen Contact Information (Name & Mobile Number) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Citizen Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800">
                        <span>Your Full Name *</span>
                        <span className="block font-hindi text-[11px] font-normal text-slate-600">
                          आपका पूरा नाम *
                        </span>
                      </label>
                      <div className="relative">
                        <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar (उदा. रमेश कुमार)"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800">
                        <span>Mobile Number (10 Digits) *</span>
                        <span className="block font-hindi text-[11px] font-normal text-slate-600">
                          मोबाइल नंबर (10 अंक) *
                        </span>
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={formData.mobile}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({ ...formData, mobile: val });
                          }}
                          placeholder="e.g. 9876543210 (10 अंक)"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      <span>Complaint Title / Subject *</span>
                      <span className="block font-hindi text-[11px] font-normal text-slate-600">
                        शिकायत का विषय या मुख्य शीर्षक *
                      </span>
                    </label>
                    <div className="relative">
                      <FileText className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Hazardous pothole near main traffic junction (उदा. मुख्य चौराहे के पास खतरनाक गड्ढा)"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      <span>Detailed Description *</span>
                      <span className="block font-hindi text-[11px] font-normal text-slate-600">
                        समस्या का विस्तृत विवरण *
                      </span>
                    </label>
                    <textarea
                      rows="3"
                      required
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Explain what is broken, how long it has been there, and any safety hazards... (समस्या का पूरा ब्यौरा लिखें: यह कब से है और क्या खतरा है...)"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y placeholder:text-slate-400"
                    />
                  </div>

                  {/* Location with Automatic Live GPS & Granular Civic Breakdown */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        <span>Location & Exact Spot *</span>
                        <span className="block font-hindi text-[11px] font-normal text-slate-600">
                          सटीक स्थान, सोसाइटी, सड़क एवं वार्ड पता *
                        </span>
                      </label>

                      {/* 100% Automatic One-Click Live GPS Location Button */}
                      <button
                        type="button"
                        onClick={handleGetLiveLocation}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed group"
                        title="Auto-detect current GPS location / स्वतः वर्तमान जीपीएस एवं सोसाइटी/सड़क का पता लगाएं"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                            <span>Detecting Address...</span>
                            <span className="font-hindi text-[11px] text-blue-600 font-normal hidden sm:inline">(खोज जारी है...)</span>
                          </>
                        ) : (
                          <>
                            <LocateFixed className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span>Use Live Location</span>
                            <span className="font-hindi text-[11px] text-blue-600 font-normal hidden sm:inline">(ऑटोमैटिक लाइव स्थान)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Main Location Input Textbox */}
                    <div className="relative">
                      <MapPin className="h-4 w-4 text-blue-600 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={e => {
                          setFormData({ ...formData, location: e.target.value });
                          if (locationError) setLocationError('');
                          if (locationSuccess) setLocationSuccess('');
                        }}
                        placeholder="e.g. ATS Greens Village, Sector 93A, Noida, Express Highway Road"
                        className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                      />
                      {formData.location && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, location: '' }));
                            setLocationSuccess('');
                            setAddressBreakdown(null);
                          }}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
                          title="Clear location / स्थान साफ़ करें"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Status Feedback Banners */}
                    {locationSuccess && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-medium animate-fade-in">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{locationSuccess}</span>
                      </div>
                    )}

                    {locationError && (
                      <div className="flex items-start gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-medium animate-fade-in">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{locationError}</span>
                      </div>
                    )}

                    {/* AUTOMATIC CIVIC ADDRESS BREAKDOWN & FINE-TUNE PANEL */}
                    {addressBreakdown && (
                      <div className="p-3.5 bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/40 border border-blue-200 rounded-xl space-y-3 animate-fade-in shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-blue-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-bold text-slate-800">
                              Detailed Civic Breakdown
                            </span>
                            <span className="font-hindi text-[10px] text-slate-500 hidden sm:inline">
                              (सोसाइटी, सड़क एवं कॉलोनी विवरण - नीचे सीधे एडिट करें)
                            </span>
                          </div>
                          {addressBreakdown.lat && (
                            <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block self-start sm:self-auto">
                              GPS: {addressBreakdown.lat}, {addressBreakdown.lon} {addressBreakdown.accuracy ? `(±${addressBreakdown.accuracy}m)` : ''}
                            </span>
                          )}
                        </div>

                        {/* Quick-Add Suggestions Chips if available */}
                        {addressBreakdown.suggestions && addressBreakdown.suggestions.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pb-0.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                              <span>⚡ Quick Add:</span>
                            </span>
                            {addressBreakdown.suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAddSuggestion(sug)}
                                className="px-2.5 py-0.5 bg-white hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 hover:border-blue-300 rounded-full text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                                title={`Click to add ${sug} to your location`}
                              >
                                + {sug}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* Society / Complex / Building / Enclave */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs space-y-1 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                                <span>🏢</span>
                                <span>Society / Apartment / Building</span>
                              </span>
                              <span className="text-[9px] text-blue-600 font-medium">Editable</span>
                            </div>
                            <input
                              type="text"
                              value={addressBreakdown.society || ''}
                              onChange={e => handleUpdateBreakdown('society', e.target.value)}
                              placeholder="e.g. Goyal Heights, House 42, Block B..."
                              className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                          </div>

                          {/* Road / Street */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs space-y-1 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                                <span>🛣️</span>
                                <span>Road / Street / Main Lane</span>
                              </span>
                              <span className="text-[9px] text-blue-600 font-medium">Editable</span>
                            </div>
                            <input
                              type="text"
                              value={addressBreakdown.road || ''}
                              onChange={e => handleUpdateBreakdown('road', e.target.value)}
                              placeholder="e.g. Deva Road, Faizabad Road, Lane 3..."
                              className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                          </div>

                          {/* Colony / Sector / Mohalla */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs space-y-1 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                                <span>📍</span>
                                <span>Colony / Sector / Mohalla</span>
                              </span>
                              <span className="text-[9px] text-blue-600 font-medium">Editable</span>
                            </div>
                            <input
                              type="text"
                              value={addressBreakdown.colony || ''}
                              onChange={e => handleUpdateBreakdown('colony', e.target.value)}
                              placeholder="e.g. Takrohi, Tiwariganj..."
                              className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                          </div>

                          {/* City & PIN Code */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs space-y-1 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide flex items-center gap-1">
                                <span>🏙️</span>
                                <span>City & Postal Code</span>
                              </span>
                              <span className="text-[9px] text-blue-600 font-medium">Editable</span>
                            </div>
                            <input
                              type="text"
                              value={addressBreakdown.city || ''}
                              onChange={e => handleUpdateBreakdown('city', e.target.value)}
                              placeholder="e.g. Lucknow - 226028..."
                              className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                            />
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                          <Info className="h-3 w-3 shrink-0 text-blue-500" />
                          <span>All boxes above are editable. Type your Society name or Road and the full address updates automatically.</span>
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Info className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>Click "Use Live Location" to automatically detect your society, road and colony via high-precision GPS.</span>
                    </p>
                  </div>

                  {/* Attachment / Photo Proof (Optional) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                          Attachment / Photo Proof (Optional)
                        </span>
                        <span className="block font-hindi text-[11px] font-normal text-slate-600">
                          संलग्नक / फोटो प्रमाण (वैकल्पिक)
                        </span>
                      </label>
                      {formData.image_url && (
                        <button
                          type="button"
                          onClick={handleRemoveAttachment}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove (हटाएं)</span>
                        </button>
                      )}
                    </div>

                    {!formData.image_url ? (
                      <div className="space-y-2">
                        {/* Drag & drop / click upload box */}
                        <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-3.5 sm:p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="p-2 bg-white group-hover:bg-blue-100 rounded-full border border-slate-200 group-hover:border-blue-300 text-slate-500 group-hover:text-blue-600 transition-colors mb-1.5 shadow-xs">
                            <Upload className="h-4 w-4" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                              Click to choose photo or drag & drop
                            </p>
                            <p className="text-[11px] font-hindi text-slate-500">
                              फोटो चुनने के लिए क्लिक करें या यहाँ छोड़ें
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              PNG, JPG, JPEG, WEBP (Max 5MB)
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      /* Uploaded Attachment Preview Card */
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-white border border-blue-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                            {formData.image_url.startsWith('data:image') || formData.image_url.startsWith('http') ? (
                              <img
                                src={formData.image_url}
                                alt="Attachment preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Paperclip className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {attachmentMeta?.name || 'Attached Evidence Photo'}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span>{attachmentMeta?.size || 'Ready to submit'}</span>
                              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <Check className="h-3 w-3" /> Ready
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => window.open(formData.image_url, '_blank')}
                            className="p-1.5 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Preview in new tab / पूर्ण आकार में देखें"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveAttachment}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Remove attachment / हटाएं"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {attachmentError && (
                      <div className="flex items-start gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{attachmentError}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Submitting... (दर्ज हो रहा है...)</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Submit Complaint</span>
                          <span className="font-hindi text-xs font-normal">(शिकायत सबमिट करें)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full sm:w-auto py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Cancel (रद्द करें)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP FAQ MODAL: Opened via '?' symbol in top header */}
      {faqModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setFaqModalOpen(false)}
        >
          <div
            className="sub-box-card bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Accent Gradient Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>

            {/* Modal Header */}
            <div className="px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                  ?
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Frequently Asked Questions (FAQ)
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      8 Q&As
                    </span>
                  </div>
                  <p className="font-hindi text-xs sm:text-[13px] font-bold text-slate-600">
                    नागरिक सहायता, सामान्य प्रश्न एवं विस्तृत उत्तर
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close / बंद करें"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar & Category Filters */}
            <div className="px-6 pt-4 pb-3 border-b border-slate-100 bg-white space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={e => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. tracking, inspection time, phone, emergency)..."
                  className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                />
                {faqSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setFaqSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {faqCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setFaqCategory(cat.id);
                      setOpenFaq(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      faqCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{cat.nameEn}</span>
                    <span className={`text-[10px] ${faqCategory === cat.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      ({cat.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable FAQ Accordion List */}
            <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <Info className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-sm font-semibold text-slate-800">No matching questions found.</p>
                  <p className="font-hindi text-xs text-slate-500">खोजे गए शब्द से संबंधित कोई प्रश्न नहीं मिला।</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFaqSearchQuery('');
                      setFaqCategory('all');
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline pt-1 cursor-pointer block mx-auto"
                  >
                    Reset filters (सभी प्रश्न देखें)
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isOpen
                          ? 'border-blue-400 shadow-xs bg-blue-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer group"
                      >
                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 inline-block mb-1">
                            {faq.tagEn} • {faq.tagHi}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {faq.qEn}
                          </h4>
                          <p className="font-hindi text-[11px] sm:text-xs font-semibold text-slate-600 leading-snug">
                            {faq.qHi}
                          </p>
                        </div>

                        <div className={`p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-blue-600 text-white group-hover:bg-blue-600 group-hover:text-white' : ''}`}>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 space-y-2 text-xs leading-relaxed border-t border-slate-100 bg-white animate-fade-in">
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 leading-relaxed">
                            <p>{faq.aEn}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 leading-relaxed">
                            <p className="font-hindi">{faq.aHi}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer with 24x7 Helpline and Actions */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 text-center sm:text-left">
                <PhoneCall className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>24x7 Municipal Helpline: <strong className="font-mono text-slate-900">1800-120-2026 / 1916</strong></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFaqModalOpen(false);
                    setModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>File Grievance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
