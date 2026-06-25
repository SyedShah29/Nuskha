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
  if (level >= 80) return 'text-[#059669]';
  if (level >= 50) return 'text-[#F59E0B]';
  return 'text-foreground';
}

function getSeverityBadge(severity: string) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    critical: { bg: 'bg-[#EF4444]', text: 'text-white', label: 'Critical' },
    emergency: { bg: 'bg-[#EF4444]', text: 'text-white', label: 'Emergency' },
    urgent: { bg: 'bg-[#F97316]', text: 'text-white', label: 'Urgent' },
    high: { bg: 'bg-[#F97316]', text: 'text-white', label: 'High' },
    moderate: { bg: 'bg-[#F59E0B]', text: 'text-white', label: 'Moderate' },
    normal: { bg: 'bg-[#059669]', text: 'text-white', label: 'Stable' },
    initial: { bg: 'bg-foreground', text: 'text-white', label: 'Initial' },
  };
  const { bg, text, label } = config[severity] || config.initial;
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono-data tracking-wide uppercase ${bg} ${text}`}>
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
        content: "Hello! I'm your Clinical AI. I'll ask you some questions to understand your symptoms better. What brings you here today?",
        urdu: 'السلام علیکم! میں آپ کا کلینیکل اے آئی ہوں۔ میں آپ کی علامات کو بہتر سمجھنے کے لیے کچھ سوالات پوچھوں گا۔ آج آپ یہاں کیوں آئے ہیں؟',
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
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ur-PK';
      transcriptRef.current = '';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        // In continuous mode, accumulate final segments + show interim in real time
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        transcriptRef.current = finalTranscript;
        // Show combined final + interim so user sees live transcription
        const displayText = finalTranscript + interimTranscript;
        setState((prev) => ({ ...prev, inputValue: displayText }));
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
      </div>
    );
  }

  if (mode === 'voice') {
    return (
      <div className="min-h-screen flex bg-background relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#059669]/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          <header className="bg-surface/80 backdrop-blur-xl border-b border-border z-40">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/patient/dashboard">
                  <button className="p-2 rounded-xl hover:bg-[rgba(15,17,23,0.04)] border border-transparent hover:border-border transition-colors">
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[rgba(15,17,23,0.06)] bg-surface shadow-sm overflow-hidden">
                    <Image src="/images/nuskha_logo.png" alt="Nuskha" width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <h1 className="font-bold text-foreground tracking-tight leading-none">Clinical Voice AI</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-mono-data">Analysis Session</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(15,17,23,0.04)] border border-border rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold font-mono-data text-foreground">{formatTime(state.sessionTime)}</span>
                </div>
                <button onClick={() => setState((prev) => ({ ...prev, showEndDialog: true }))} className="btn-ghost text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20">
                  End Session
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              {state.messages.length > 0 && (
                <motion.div key={state.messages[state.messages.length - 1].id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl mb-8">
                  <div className="card-surface p-8 text-center">
                    {state.messages[state.messages.length - 1].role === 'assistant' && state.isLoading && (
                      <ThinkingActivity isThinking={true} steps={state.currentThinkingSteps} />
                    )}
                    <p className="text-foreground text-xl leading-relaxed mb-4">{state.messages[state.messages.length - 1].content}</p>
                    {state.messages[state.messages.length - 1].urdu && (
                      <p className="font-urdu text-[#059669] text-2xl leading-relaxed" dir="rtl">{state.messages[state.messages.length - 1].urdu}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <VoiceOrb isSpeaking={state.isSpeaking} isListening={state.isListening} isProcessing={state.isLoading} onStartListening={startListening} onStopListening={stopListening} disabled={state.isLoading || state.isSpeaking} />

            {state.voiceError && (
              <div className="mt-6 max-w-md rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-center text-sm font-bold text-[#EF4444]">{state.voiceError}</div>
            )}

            {state.inputValue && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 w-full max-w-lg">
                <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                  <p className="text-foreground text-center text-lg">{state.inputValue}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <button onClick={() => setState((prev) => ({ ...prev, inputValue: '' }))} className="btn-ghost py-2 text-sm">
                      <X className="w-4 h-4 mr-1" /> Clear
                    </button>
                    <button onClick={() => handleSendMessage()} className="btn-primary py-2 px-6 text-sm">
                      <Send className="w-4 h-4 mr-2" /> Transmit
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>

        <button onClick={() => setState((prev) => ({ ...prev, showVoiceSidebar: !prev.showVoiceSidebar }))} className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 p-3 bg-surface shadow-lg rounded-l-2xl border border-r-0 border-border transition-all ${state.showVoiceSidebar ? 'mr-80' : 'mr-0'}`}>
          <ChevronLeft className={`w-5 h-5 text-foreground transition-transform ${state.showVoiceSidebar ? '' : 'rotate-180'}`} />
        </button>

        <AnimatePresence>
          {state.showVoiceSidebar && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-surface/90 backdrop-blur-xl border-l border-border overflow-hidden flex-shrink-0 z-40 relative">
              <div className="w-80 p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bold text-foreground tracking-tight">Clinical Telemetry</h2>
                  <button onClick={() => setState((prev) => ({ ...prev, showVoiceSidebar: false }))} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>
                
                <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-[#059669]" /><span className="text-foreground text-sm font-bold">Diagnostic Confidence</span></div>
                    <span className={`text-lg font-bold font-mono-data ${getConfidenceColor(state.diagnosisProgress.confidence)}`}>{state.diagnosisProgress.confidence}%</span>
                  </div>
                  <div className="h-2 bg-[rgba(15,17,23,0.06)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${state.diagnosisProgress.confidence}%` }} className="h-full bg-[#059669]" />
                  </div>
                </div>

                {(state.isLoading || state.currentThinkingSteps.length > 0) && (
                  <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-4 border border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">{state.isLoading ? 'Agent Reasoning' : 'Last Analysis'}</h3>
                    <ThinkingActivity isThinking={state.isLoading} steps={state.currentThinkingSteps} />
                  </div>
                )}
                
                {state.messages.length > 0 && state.messages[state.messages.length - 1].thinkingSteps && (
                  <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-4 border border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Previous Reasoning</h3>
                    <ThinkingActivity isThinking={false} steps={state.messages[state.messages.length - 1].thinkingSteps!} duration={state.messages[state.messages.length - 1].thinkingDuration} />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-4 text-center border border-border">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs font-bold uppercase mb-2"><Sparkles className="w-3 h-3" /> Vectors</div>
                    <p className="text-2xl font-bold text-foreground font-mono-data">{state.diagnosisProgress.symptomsIdentified}</p>
                  </div>
                  <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-4 text-center border border-border">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs font-bold uppercase mb-2"><MessageSquare className="w-3 h-3" /> Turns</div>
                    <p className="text-2xl font-bold text-foreground font-mono-data">{state.sessionInfo?.conversationTurn || 0}</p>
                  </div>
                </div>

                {state.diagnosisProgress.topConditions.length > 0 && (
                  <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-4 border border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Top Vectors</h3>
                    <div className="space-y-3">
                      {state.diagnosisProgress.topConditions.map((condition, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-foreground font-medium">
                          <span className="w-6 h-6 bg-[#059669]/10 text-[#059669] rounded-full flex items-center justify-center text-xs font-mono-data font-bold">{i + 1}</span>
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 border border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Session Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium">Duration</span><span className="text-foreground font-mono-data font-bold">{formatTime(state.sessionTime)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium">Mode</span><span className="text-foreground font-bold">Voice UI</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium">Status</span>{state.sessionInfo?.severity && getSeverityBadge(state.sessionInfo.severity)}</div>
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
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-surface/80 backdrop-blur-xl border-b border-border z-40 shadow-sm flex-shrink-0 relative">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <Link href="/patient/dashboard">
                <button className="p-2 rounded-xl hover:bg-[rgba(15,17,23,0.04)] border border-transparent hover:border-border transition-colors">
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-[rgba(15,17,23,0.06)] bg-surface">
                  <Image src="/images/nuskha_logo.png" alt="Nuskha AI" width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
                    Nuskha Clinical AI <CheckCircle className="w-4 h-4 text-[#059669]" />
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono-data">Encrypted Session</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(15,17,23,0.04)] border border-border rounded-lg shadow-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold font-mono-data text-foreground">{formatTime(state.sessionTime)}</span>
              </div>
              <button onClick={() => setState((prev) => ({ ...prev, showEndDialog: true }))} className="btn-ghost text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20">
                End Session
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed">
          {/* Blend overlay to keep it readable */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative z-10">
            <AnimatePresence>
              {state.messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' ? (
                    <div className="flex gap-4 max-w-[85%]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-border bg-surface mt-1">
                        <Image src="/images/nuskha_logo.png" alt="AI" width={40} height={40} className="object-cover" />
                      </div>
                      <div className="flex-1 card-surface rounded-2xl rounded-tl-none p-6 shadow-sm border border-border">
                        {message.thinkingSteps && message.thinkingSteps.length > 0 && (
                          <ThinkingActivity isThinking={false} steps={message.thinkingSteps} duration={message.thinkingDuration} />
                        )}
                        {message.severity && message.severity !== 'normal' && <div className="mb-4">{getSeverityBadge(message.severity)}</div>}
                        <div className="text-foreground text-lg leading-relaxed">
                          {message.isTyping ? (
                            <TypingText text={message.content} speed={15} onComplete={() => handleTypingComplete(message.id)} />
                          ) : (
                            message.content
                          )}
                        </div>
                        {message.urdu && !message.isTyping && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="font-urdu text-[#059669] text-right text-lg" dir="rtl">{message.urdu}</p>
                            {mode === 'text' && (
                              <button onClick={() => speakText(message.urdu!)} disabled={state.isSpeaking} className="mt-3 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-[#059669] transition-colors">
                                {state.isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                Listen in Urdu
                              </button>
                            )}
                          </div>
                        )}
                        {message.confidenceLevel !== undefined && (
                          <div className="mt-4 flex items-center gap-4 text-xs font-bold text-muted-foreground">
                            <span className={`flex items-center gap-1 font-mono-data ${getConfidenceColor(message.confidenceLevel)}`}>
                              <Brain className="w-4 h-4" /> {message.confidenceLevel}% Confident
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0F1117] rounded-2xl rounded-tr-none px-6 py-4 max-w-[70%] shadow-md border border-[rgba(255,255,255,0.1)]">
                      <p className="text-white text-lg leading-relaxed">{message.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {state.isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-border bg-surface">
                  <Image src="/images/nuskha_logo.png" alt="AI" width={40} height={40} className="object-cover" />
                </div>
                <div className="flex-1 card-surface rounded-2xl p-5 shadow-sm border border-border max-w-[85%]">
                  <ThinkingActivity isThinking={true} steps={state.currentThinkingSteps} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="border-t border-border bg-surface/80 backdrop-blur-xl p-6 flex-shrink-0 z-20 shadow-[0_-4px_24px_rgba(15,17,23,0.04)]">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={state.inputValue}
                onChange={(e) => setState((prev) => ({ ...prev, inputValue: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && !state.isLoading && handleSendMessage()}
                placeholder="Describe your symptoms in detail..."
                disabled={state.isLoading}
                className="w-full pl-6 pr-16 py-4 bg-[rgba(15,17,23,0.02)] border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-[#059669]/10 focus:border-[#059669] transition-all shadow-sm disabled:opacity-50 text-lg"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!state.inputValue.trim() || state.isLoading}
                className="absolute right-3 p-3 bg-[#059669] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#047857] transition-transform hover:scale-105 active:scale-95 shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {state.showActivityPanel && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-surface border-l border-border overflow-hidden z-30 shadow-2xl relative">
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-foreground tracking-tight">Real-Time Telemetry</h2>
                <button onClick={() => setState((prev) => ({ ...prev, showActivityPanel: false }))} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-4 border border-border">
                <h3 className="eyebrow mb-4">Diagnostic Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted-foreground">Confidence</span>
                    <span className={`font-mono-data font-bold text-lg ${getConfidenceColor(state.diagnosisProgress.confidence)}`}>{state.diagnosisProgress.confidence}%</span>
                  </div>
                  <div className="h-2 bg-[rgba(15,17,23,0.06)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${state.diagnosisProgress.confidence}%` }} className="h-full bg-[#059669]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-surface rounded-xl p-3 text-center border border-border shadow-sm">
                      <p className="eyebrow mb-1">Vectors</p>
                      <p className="text-2xl font-bold font-mono-data text-foreground">{state.diagnosisProgress.symptomsIdentified}</p>
                    </div>
                    <div className="bg-surface rounded-xl p-3 text-center border border-border shadow-sm">
                      <p className="eyebrow mb-1">Turns</p>
                      <p className="text-2xl font-bold font-mono-data text-foreground">{state.sessionInfo?.conversationTurn || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              {state.diagnosisProgress.topConditions.length > 0 && (
                <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-4 border border-border">
                  <h3 className="eyebrow mb-4">Top Vectors</h3>
                  <div className="space-y-3">
                    {state.diagnosisProgress.topConditions.map((condition, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <span className="w-6 h-6 bg-[#059669]/10 text-[#059669] font-mono-data font-bold rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 border border-border">
                <h3 className="eyebrow mb-4">Session Context</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center"><span className="font-bold text-muted-foreground">Duration</span><span className="font-bold font-mono-data text-foreground">{formatTime(state.sessionTime)}</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold text-muted-foreground">Status</span>{state.sessionInfo?.severity && getSeverityBadge(state.sessionInfo.severity)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.showEndDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="card-surface p-8 max-w-md w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#EF4444]/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#EF4444]/20">
                  <FileText className="w-8 h-8 text-[#EF4444]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Finalize Assessment?</h2>
                <p className="font-urdu text-muted-foreground">&#1603;&#1610;&#1575; &#1570;&#1608;&#1575;&#1585; &#1587;&#1610;&#1588;&#1606; &#1582;&#1578;&#1605; &#1603;&#1585;&#1606;&#1575; &#1608;&#1583;&#1575;&#1583;&#1587;&#1578;&#1607; &#1581;&#1578;&#1605;&#1610; &#1607;&#1610;&#1606; &#1602;&#1575;&#1574;&#1610;&#1610;&#1575;&#1576;&#1575;&#1606;&#1567;</p>
              </div>
              <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-6 space-y-3 border border-border text-sm">
                <div className="flex justify-between items-center"><span className="font-bold text-muted-foreground">Session Duration</span><span className="font-mono-data font-bold text-foreground">{formatTime(state.sessionTime)}</span></div>
                <div className="flex justify-between items-center"><span className="font-bold text-muted-foreground">Data Confidence</span><span className={`font-mono-data font-bold ${getConfidenceColor(state.diagnosisProgress.confidence)}`}>{state.diagnosisProgress.confidence}%</span></div>
              </div>
              {state.diagnosisProgress.confidence < 50 && (
                <div className="flex items-center gap-3 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl mb-6 text-[#F59E0B] text-sm font-bold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  Confidence is low. Consider providing more detail before generating the report.
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={() => setState((prev) => ({ ...prev, showEndDialog: false }))} className="btn-ghost flex-1 justify-center">
                  Continue Chat
                </button>
                <button onClick={generateReport} className="btn-primary flex-1 justify-center" disabled={state.isGeneratingReport}>
                  {state.isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Generate Report
                </button>
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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 border-4 text-[#059669] animate-spin" />
        </div>
      }
    >
      <InterviewPageContent />
    </Suspense>
  );
}
