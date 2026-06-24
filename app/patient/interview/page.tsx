'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Clock,
  ChevronLeft,
  Loader2,
  Volume2,
  VolumeX,
  AlertTriangle,
  FileText,
  Brain,
  Sparkles,
  MessageSquare,
  X,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ReportCompleteDialog } from '@/components/ui/ReportCompleteDialog';
import {
  ThinkingActivity,
  TypingText,
  generateThinkingSteps,
} from '@/components/ui/ThinkingActivity';
import { VoiceOrb } from '@/components/ui/VoiceOrbNew';

const HEXAGON_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%233f69b8' fill-opacity='0.21' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

interface ThinkingStep {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'running' | 'completed';
  details?: string;
  icon: 'database' | 'brain' | 'search' | 'file' | 'shield' | 'sparkles';
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  urdu?: string;
  timestamp: Date;
  severity?: 'critical' | 'high' | 'moderate' | 'initial' | 'normal' | 'emergency' | 'urgent';
  confidenceLevel?: number;
  diseaseCount?: number;
  thinkingSteps?: ThinkingStep[];
  thinkingDuration?: number;
  isTyping?: boolean;
}

interface SessionInfo {
  id: string;
  confidenceLevel: number;
  severity: string;
  identifiedSymptoms: string[];
  isConfident: boolean;
  diseaseCount: number;
  conversationTurn: number;
}

interface DiagnosisProgress {
  initialDiseases: number;
  currentDiseases: number;
  confidence: number;
  topConditions: string[];
  symptomsIdentified: number;
}

interface InterviewState {
  user: { id: string; name?: string; email?: string } | null;
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  sessionTime: number;
  showEndDialog: boolean;
  isGeneratingReport: boolean;
  sessionInfo: SessionInfo | null;
  showReportDialog: boolean;
  patientInfo: { age?: number; gender?: string; chronicConditions?: string[] } | null;
  isSpeaking: boolean;
  isListening: boolean;
  voiceError: string;
  currentAudio: HTMLAudioElement | null;
  diagnosisProgress: DiagnosisProgress;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diagnosisState: any;
  currentThinkingSteps: ThinkingStep[];
  thinkingStartTime: number;
  showActivityPanel: boolean;
  showVoiceSidebar: boolean;
  mode: 'voice' | 'text';
}

function getConfidenceColor(level: number) {
  if (level >= 80) return 'text-green-600';
  if (level >= 50) return 'text-yellow-600';
  return 'text-blue-600';
}

function getSeverityBadge(severity: string) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: 'bg-red-500', text: 'text-white', label: 'Critical' },
    emergency: { bg: 'bg-red-500', text: 'text-white', label: 'Emergency' },
    urgent: { bg: 'bg-orange-500', text: 'text-white', label: 'Urgent' },
    high: { bg: 'bg-orange-500', text: 'text-white', label: 'High' },
    moderate: { bg: 'bg-yellow-500', text: 'text-white', label: 'Moderate' },
    normal: { bg: 'bg-green-500', text: 'text-white', label: 'Stable' },
    initial: { bg: 'bg-blue-500', text: 'text-white', label: 'Initial' },
  };
  const { bg, text, label } = config[severity] || config.initial;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function InterviewPageContent() {
  const [state, setState] = useState<InterviewState>({
    user: null,
    messages: [],
    inputValue: '',
    isLoading: false,
    sessionTime: 0,
    showEndDialog: false,
    isGeneratingReport: false,
    sessionInfo: null,
    showReportDialog: false,
    patientInfo: null,
    isSpeaking: false,
    isListening: false,
    voiceError: '',
    currentAudio: null,
    diagnosisProgress: { initialDiseases: 50, currentDiseases: 50, confidence: 0, topConditions: [], symptomsIdentified: 0 },
    diagnosisState: null,
    currentThinkingSteps: [],
    thinkingStartTime: Date.now(),
    showActivityPanel: false,
    showVoiceSidebar: true,
    mode: 'text',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode') === 'voice' ? 'voice' : 'text';
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const ttsInFlightRef = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setState((prev) => ({ ...prev, mode }));
  }, [mode]);

  useEffect(() => {
    const initializeSession = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const userInfo = { id: data.user.id, name: data.user.name, email: data.user.email };
      setState((prev) => ({ ...prev, user: userInfo }));

      try {
        const historyRes = await fetch('/api/medical-history');
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData.medicalHistory) {
            setState((prev) => ({
              ...prev,
              patientInfo: {
                age: historyData.medicalHistory.age,
                gender: historyData.medicalHistory.gender,
                chronicConditions: historyData.medicalHistory.chronicConditions || [],
              },
            }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch medical history:', e);
      }

      try {
        const sessionRes = await fetch('/api/clinical-chat', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        });
        const sessionData = await sessionRes.json();
        if (sessionData.sessionId) {
          setState((prev) => ({
            ...prev,
            sessionInfo: {
              id: sessionData.sessionId,
              confidenceLevel: 0,
              severity: 'normal',
              identifiedSymptoms: [],
              isConfident: false,
              diseaseCount: 50,
              conversationTurn: 0,
            },
          }));
        }
      } catch (e) {
        console.error('Failed to create session:', e);
      }

      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI health assistant. I'll ask you some questions to understand your symptoms better. What brings you here today?",
        urdu: 'السلام علیکم! میں آپ کا اے آئی ہیلتھ اسسٹنٹ ہوں۔ میں آپ کی علامات کو بہتر سمجھنے کے لیے کچھ سوالات پوچھوں گا۔ آج آپ یہاں کیوں آئے ہیں؟',
        timestamp: new Date(),
        severity: 'normal',
        confidenceLevel: 0,
        diseaseCount: 50,
        isTyping: false,
      };
      setState((prev) => ({ ...prev, messages: [welcomeMessage] }));
      setLoading(false);
    };
    initializeSession();
  }, [router, mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => ({ ...prev, sessionTime: prev.sessionTime + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const speakText = async (text: string) => {
    if (!text || ttsInFlightRef.current || state.isSpeaking || state.currentAudio) return;
    ttsInFlightRef.current = true;
    setState((prev) => ({ ...prev, isSpeaking: true }));
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'ur' }),
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        const clearAudioState = () => {
          URL.revokeObjectURL(audioUrl);
          setState((prev) => ({ ...prev, isSpeaking: false, currentAudio: null }));
          ttsInFlightRef.current = false;
        };
        setState((prev) => ({ ...prev, currentAudio: audio }));
        audio.onended = clearAudioState;
        audio.onerror = clearAudioState;
        await audio.play();
      } else {
        setState((prev) => ({ ...prev, isSpeaking: false }));
        ttsInFlightRef.current = false;
      }
    } catch (e) {
      console.error('TTS failed:', e);
      setState((prev) => ({ ...prev, isSpeaking: false }));
      ttsInFlightRef.current = false;
    }
  };

  const stopSpeaking = () => {
    if (state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio.currentTime = 0;
      setState((prev) => ({ ...prev, currentAudio: null }));
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  };

  const handleSendMessage = async (messageOverride?: string) => {
    const messageToSend = (messageOverride ?? state.inputValue).trim();
    if (!messageToSend || !state.user || state.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    const thinkingSteps = generateThinkingSteps(
      state.sessionInfo?.confidenceLevel || 0,
      state.diagnosisProgress.currentDiseases
    );

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputValue: '',
      isLoading: true,
      thinkingStartTime: Date.now(),
      currentThinkingSteps: thinkingSteps,
    }));
    transcriptRef.current = '';

    try {
      const conversationHistory = state.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/clinical-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: state.sessionInfo?.id,
          userId: state.user.id,
          conversationHistory,
          patientInfo: state.patientInfo,
          diagnosisState: state.diagnosisState || undefined,
          conversationTurn: state.sessionInfo?.conversationTurn || 0,
        }),
      });

      const data = await response.json();
      const thinkingDuration = Math.round((Date.now() - state.thinkingStartTime) / 1000);

      if (data.success && data.response) {
        const newConfidence = data.response.confidenceLevel || 0;
        const newDiseaseCount = Math.max(5, Math.round(state.diagnosisProgress.currentDiseases * (1 - newConfidence / 150)));

        if (data.nextState?.diagnosisState) {
          setState((prev) => ({ ...prev, diagnosisState: data.nextState.diagnosisState }));
        }

        setState((prev) => ({
          ...prev,
          diagnosisProgress: {
            ...prev.diagnosisProgress,
            currentDiseases: newDiseaseCount,
            confidence: newConfidence,
            topConditions: data.response.potentialDiseases?.slice(0, 5).map((d: { name: string }) => d.name) || prev.diagnosisProgress.topConditions,
            symptomsIdentified: data.response.identifiedSymptoms?.length || prev.diagnosisProgress.symptomsIdentified,
          },
        }));

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response.content,
          urdu: data.response.urdu,
          timestamp: new Date(),
          severity: data.response.severity,
          confidenceLevel: newConfidence,
          diseaseCount: newDiseaseCount,
          thinkingSteps: thinkingSteps.map((s) => ({ ...s, status: 'completed' as const })),
          thinkingDuration,
          isTyping: true,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          sessionInfo: prev.sessionInfo
            ? {
                ...prev.sessionInfo,
                confidenceLevel: newConfidence,
                severity: data.response.severity,
                identifiedSymptoms: data.response.identifiedSymptoms || prev.sessionInfo.identifiedSymptoms,
                isConfident: data.response.isConfident,
                diseaseCount: newDiseaseCount,
                conversationTurn: (prev.sessionInfo.conversationTurn || 0) + 1,
              }
            : null,
        }));

        if (mode === 'voice' && data.response.urdu) {
          setTimeout(() => speakText(data.response.urdu), 2000);
        }

        if (data.response.isConfident && newConfidence >= 95) {
          const completionMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: 'I have established a clinical narrative of your case and forwarded the Clinical Narrative Report to the doctor.',
            urdu: 'میں نے آپ کے کیس کی طبی تفصیل مرتب کر لی ہے اور کلینیکل نیریٹو رپورٹ ڈاکٹر کو بھیج دی ہے۔',
            timestamp: new Date(),
            severity: 'normal',
            confidenceLevel: newConfidence,
            isTyping: false,
          };
          setState((prev) => ({ ...prev, messages: [...prev.messages, completionMessage] }));
          if (mode === 'voice') {
            setTimeout(() => speakText(completionMessage.urdu || completionMessage.content), 3000);
          }
          setTimeout(() => setState((prev) => ({ ...prev, showReportDialog: true })), 4000);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I encountered an issue. Could you please describe your symptoms again?',
          urdu: 'معذرت، کوئی مسئلہ پیش آگیا۔ براہ کرم اپنی علامات دوبارہ بیان کریں۔',
          timestamp: new Date(),
          isTyping: true,
        };
        setState((prev) => ({ ...prev, messages: [...prev.messages, errorMessage] }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again.",
        urdu: 'کنکشن میں مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔',
        timestamp: new Date(),
        isTyping: true,
      };
      setState((prev) => ({ ...prev, messages: [...prev.messages, errorMessage] }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false, currentThinkingSteps: [] }));
    }
  };

  const generateReport = async () => {
    setState((prev) => ({ ...prev, isGeneratingReport: true }));
    try {
      const response = await fetch('/api/clinical-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Generate final report',
          sessionId: state.sessionInfo?.id,
          userId: state.user?.id,
          conversationHistory: state.messages.map((m) => ({ role: m.role, content: m.content })),
          diagnosisState: state.diagnosisState,
          conversationTurn: state.sessionInfo?.conversationTurn || 0,
          generateReport: true,
        }),
      });
      const data = await response.json();
      if (data.success && data.orchestration?.reportGenerated) {
        router.push(`/patient/dashboard?reportId=${data.orchestration.reportId}`);
      } else {
        router.push('/patient/dashboard');
      }
    } catch {
      router.push('/patient/dashboard');
    }
  };

  const handleTypingComplete = (messageId: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === messageId ? { ...m, isTyping: false } : m)),
    }));
  };

  const getSpeechErrorMessage = (error: string) => {
    switch (error) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone permission is blocked. Allow microphone access for localhost in your browser settings.';
      case 'audio-capture':
        return 'No microphone was found. Connect or select a microphone, then try again.';
      case 'no-speech':
        return 'I did not hear anything. Tap the mic and speak clearly.';
      case 'network':
        return 'Speech recognition could not reach the browser service. Check your internet connection.';
      default:
        return 'Microphone could not start. Check browser microphone permissions and try again.';
    }
  };

  const startListening = async () => {
    setState((prev) => ({ ...prev, voiceError: '' }));
    stopSpeaking();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          voiceError: error instanceof Error ? error.message : 'Microphone permission failed. Check browser settings.',
        }));
        return;
      }

      const SpeechRecognitionAPI =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ur-PK';
      transcriptRef.current = '';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((result: any) => result[0].transcript)
          .join('');
        transcriptRef.current = transcript;
        setState((prev) => ({ ...prev, inputValue: transcript }));
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setState((prev) => ({ ...prev, voiceError: getSpeechErrorMessage(event.error), isListening: false }));
      };

      recognition.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
        const transcript = transcriptRef.current.trim();
        if (transcript) handleSendMessage(transcript);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setState((prev) => ({ ...prev, isListening: true }));
      } catch {
        setState((prev) => ({ ...prev, voiceError: 'Microphone could not start. Please try again.' }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        voiceError: 'Speech recognition is not supported in this browser. Use Chrome or Edge for voice mode.',
      }));
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState((prev) => ({ ...prev, isListening: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f2f1f3', backgroundImage: HEXAGON_BG }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (mode === 'voice') {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: '#f2f1f3', backgroundImage: HEXAGON_BG }}>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-[#2c4d7b] border-b border-[#1e3557] z-40 shadow-lg flex-shrink-0">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/patient/dashboard">
                  <button className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white/10">
                    <Image src="/logo/shifa-logo.svg" alt="Shifa" width={40} height={40} />
                  </div>
                  <div>
                    <h1 className="font-semibold text-white">Voice Interview</h1>
                    <p className="text-xs text-white/70">AI-powered clinical assessment</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-medium text-white">{formatTime(state.sessionTime)}</span>
                </div>
                <button onClick={() => setState((prev) => ({ ...prev, showEndDialog: true }))} className="px-4 py-1.5 text-sm font-medium text-red-500 bg-white rounded-xl hover:bg-red-50 transition-colors">
                  End Session
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              {state.messages.length > 0 && (
                <motion.div key={state.messages[state.messages.length - 1].id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-lg mb-8">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm">
                    {state.messages[state.messages.length - 1].role === 'assistant' && state.isLoading && (
                      <ThinkingActivity isThinking={true} steps={state.currentThinkingSteps} />
                    )}
                    <p className="text-slate-700 text-center text-lg mb-2">{state.messages[state.messages.length - 1].content}</p>
                    {state.messages[state.messages.length - 1].urdu && (
                      <p className="font-urdu text-primary text-center text-lg" dir="rtl">{state.messages[state.messages.length - 1].urdu}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <VoiceOrb isSpeaking={state.isSpeaking} isListening={state.isListening} isProcessing={state.isLoading} onStartListening={startListening} onStopListening={stopListening} disabled={state.isLoading || state.isSpeaking} />

            {state.voiceError && (
              <div className="mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">{state.voiceError}</div>
            )}

            {state.inputValue && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full max-w-md">
                <div className="bg-white/80 rounded-xl p-4 border border-slate-200 shadow-sm">
                  <p className="text-slate-600 text-center">{state.inputValue}</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <button onClick={() => setState((prev) => ({ ...prev, inputValue: '' }))} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1">
                      <X className="w-4 h-4" /> Clear
                    </button>
                    <button onClick={() => handleSendMessage()} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>

        <button onClick={() => setState((prev) => ({ ...prev, showVoiceSidebar: !prev.showVoiceSidebar }))} className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-white shadow-lg rounded-l-lg border border-r-0 border-slate-200 transition-all ${state.showVoiceSidebar ? 'mr-80' : 'mr-0'}`}>
          <ChevronLeft className={`w-5 h-5 text-slate-600 transition-transform ${state.showVoiceSidebar ? '' : 'rotate-180'}`} />
        </button>

        <AnimatePresence>
          {state.showVoiceSidebar && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-white/90 backdrop-blur-sm border-l border-slate-200 overflow-hidden flex-shrink-0">
              <div className="w-80 p-4 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-700 font-semibold">Analysis Progress</h2>
                  <button onClick={() => setState((prev) => ({ ...prev, showVoiceSidebar: false }))} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /><span className="text-slate-600 text-sm font-medium">Confidence</span></div>
                    <span className={`text-lg font-bold ${getConfidenceColor(state.diagnosisProgress.confidence)}`}>{state.diagnosisProgress.confidence}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${state.diagnosisProgress.confidence}%` }} className="h-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                </div>
                {(state.isLoading || state.currentThinkingSteps.length > 0) && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">{state.isLoading ? 'Agent Reasoning' : 'Last Analysis'}</h3>
                    <ThinkingActivity isThinking={state.isLoading} steps={state.currentThinkingSteps} />
                  </div>
                )}
                {state.messages.length > 0 && state.messages[state.messages.length - 1].thinkingSteps && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">Previous Reasoning</h3>
                    <ThinkingActivity isThinking={false} steps={state.messages[state.messages.length - 1].thinkingSteps!} duration={state.messages[state.messages.length - 1].thinkingDuration} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1"><Sparkles className="w-3 h-3" /> Symptoms</div>
                    <p className="text-xl font-bold text-slate-700">{state.diagnosisProgress.symptomsIdentified}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1"><MessageSquare className="w-3 h-3" /> Questions</div>
                    <p className="text-xl font-bold text-slate-700">{state.sessionInfo?.conversationTurn || 0}</p>
                  </div>
                </div>
                {state.diagnosisProgress.topConditions.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">Top Conditions</h3>
                    <div className="space-y-2">
                      {state.diagnosisProgress.topConditions.map((condition, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h3 className="text-sm font-medium text-slate-600 mb-3">Session Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-slate-700">{formatTime(state.sessionTime)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Mode</span><span className="text-slate-700">Voice</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Status</span>{state.sessionInfo?.severity && getSeverityBadge(state.sessionInfo.severity)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ReportCompleteDialog isOpen={state.showReportDialog} onClose={() => setState((prev) => ({ ...prev, showReportDialog: false }))} sessionId={state.sessionInfo?.id} />
      </div>
    );
  }

  // Text Mode UI
  return (
    <div className="min-h-screen flex bg-[var(--background)] bg-[url('/images/noise.png')] bg-blend-multiply">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-[var(--primary)] border-b border-[var(--secondary)]/30 z-40 shadow-xl flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/images/noise.png')]" />
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <Link href="/patient/dashboard">
                <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-[var(--secondary)]" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-[var(--secondary)]/30 bg-[var(--background)]">
                  <Image src="/images/avatar_hakim.png" alt="Hakim AI" width={40} height={40} />
                </div>
                <div>
                  <h1 className="font-serif text-lg font-bold text-[var(--background)] flex items-center gap-2">
                    Hakim AI <CheckCircle className="w-4 h-4 text-[var(--secondary)]" />
                  </h1>
                  <p className="text-xs text-[var(--secondary)] font-serif italic">AI Medieval Healer</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-lg shadow-sm border border-[var(--secondary)]/20">
                <Clock className="w-4 h-4 text-[var(--secondary)]" />
                <span className="text-sm font-medium text-[var(--secondary)]">{formatTime(state.sessionTime)}</span>
              </div>
              <button onClick={() => setState((prev) => ({ ...prev, showEndDialog: true }))} className="px-4 py-1.5 text-sm font-serif font-medium text-[var(--background)] border border-[var(--secondary)] rounded-full hover:bg-[var(--secondary)]/20 transition-colors">
                End Session
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence>
              {state.messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' ? (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-[var(--secondary)]/30 mt-1">
                        <Image src="/images/avatar_hakim.png" alt="AI" width={40} height={40} />
                      </div>
                      <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl rounded-tl-none p-5 shadow-sm border border-[var(--secondary)]/20 font-serif">
                        {message.thinkingSteps && message.thinkingSteps.length > 0 && (
                          <ThinkingActivity isThinking={false} steps={message.thinkingSteps} duration={message.thinkingDuration} />
                        )}
                        {message.severity && message.severity !== 'normal' && <div className="mb-2">{getSeverityBadge(message.severity)}</div>}
                        <div className="text-slate-700">
                          {message.isTyping ? (
                            <TypingText text={message.content} speed={15} onComplete={() => handleTypingComplete(message.id)} />
                          ) : (
                            message.content
                          )}
                        </div>
                        {message.urdu && !message.isTyping && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="font-urdu text-primary text-right" dir="rtl">{message.urdu}</p>
                            {mode === 'text' && (
                              <button onClick={() => speakText(message.urdu!)} disabled={state.isSpeaking} className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors">
                                {state.isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                Listen in Urdu
                              </button>
                            )}
                          </div>
                        )}
                        {message.confidenceLevel !== undefined && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                            <span className={`flex items-center gap-1 ${getConfidenceColor(message.confidenceLevel)}`}>
                              <Brain className="w-3 h-3" /> {message.confidenceLevel}% confident
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--primary)] rounded-2xl rounded-tr-none px-5 py-4 max-w-[70%] shadow-md border border-[var(--primary)] font-serif">
                      <p className="text-[var(--background)] leading-relaxed">{message.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {state.isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                  <Image src="/logo/shifa-favicon.svg" alt="AI" width={32} height={32} />
                </div>
                <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
                  <ThinkingActivity isThinking={true} steps={state.currentThinkingSteps} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="border-t border-[var(--secondary)]/20 bg-white/40 backdrop-blur-xl p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={state.inputValue}
                onChange={(e) => setState((prev) => ({ ...prev, inputValue: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && !state.isLoading && handleSendMessage()}
                placeholder="Ask anything about your health..."
                disabled={state.isLoading}
                className="w-full px-6 py-4 pr-14 bg-white border border-[var(--secondary)]/30 rounded-full text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 font-serif shadow-sm disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!state.inputValue.trim() || state.isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[var(--primary)] text-[var(--background)] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary)]/90 transition-transform hover:scale-105 active:scale-95 shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {state.showActivityPanel && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-white/90 backdrop-blur-sm border-l border-slate-200 overflow-hidden">
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-700 font-semibold">Activity</h2>
                <button onClick={() => setState((prev) => ({ ...prev, showActivityPanel: false }))} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                <h3 className="text-sm font-medium text-slate-600 mb-3">Diagnosis Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Confidence</span>
                    <span className={`font-bold ${getConfidenceColor(state.diagnosisProgress.confidence)}`}>{state.diagnosisProgress.confidence}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${state.diagnosisProgress.confidence}%` }} className="h-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                      <p className="text-xs text-slate-400">Symptoms</p>
                      <p className="text-lg font-bold text-slate-700">{state.diagnosisProgress.symptomsIdentified}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                      <p className="text-xs text-slate-400">Questions</p>
                      <p className="text-lg font-bold text-slate-700">{state.sessionInfo?.conversationTurn || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              {state.diagnosisProgress.topConditions.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                  <h3 className="text-sm font-medium text-slate-600 mb-3">Top Conditions</h3>
                  <div className="space-y-2">
                    {state.diagnosisProgress.topConditions.map((condition, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-medium text-slate-600 mb-3">Session Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-slate-700">{formatTime(state.sessionTime)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Questions</span><span className="text-slate-700">{state.sessionInfo?.conversationTurn || 0}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Status</span>{state.sessionInfo?.severity && getSeverityBadge(state.sessionInfo.severity)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.showEndDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">End Session?</h2>
                <p className="font-urdu text-primary">&#1603;&#1610;&#1575; &#1570;&#1608;&#1575;&#1585; &#1587;&#1610;&#1588;&#1606; &#1582;&#1578;&#1605; &#1603;&#1585;&#1606;&#1575; &#1608;&#1583;&#1575;&#1583;&#1587;&#1578;&#1607; &#1581;&#1578;&#1605;&#1610; &#1607;&#1610;&#1606; &#1602;&#1575;&#1574;&#1610;&#1610;&#1575;&#1576;&#1575;&#1606;&#1567;</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm border border-slate-100">
                <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-slate-700">{formatTime(state.sessionTime)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Confidence</span><span className={getConfidenceColor(state.diagnosisProgress.confidence)}>{state.diagnosisProgress.confidence}%</span></div>
              </div>
              {state.diagnosisProgress.confidence < 50 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl mb-4 text-yellow-700 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Low confidence. Consider providing more details.
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={() => setState((prev) => ({ ...prev, showEndDialog: false }))} variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50">
                  Continue
                </Button>
                <Button onClick={generateReport} className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={state.isGeneratingReport}>
                  {state.isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Generate Report
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportCompleteDialog isOpen={state.showReportDialog} onClose={() => setState((prev) => ({ ...prev, showReportDialog: false }))} sessionId={state.sessionInfo?.id} />
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f2f1f3', backgroundImage: HEXAGON_BG }}>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <InterviewPageContent />
    </Suspense>
  );
}
