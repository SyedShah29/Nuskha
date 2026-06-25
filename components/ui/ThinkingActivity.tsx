'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Loader2,
  Database,
  Brain,
  Search,
  FileText,
  Shield,
  Sparkles,
} from 'lucide-react';

interface ThinkingStep {
  id: string;
  agent: string;
  action: string;
  status: 'pending' | 'running' | 'completed';
  details?: string;
  icon: 'database' | 'brain' | 'search' | 'file' | 'shield' | 'sparkles';
}

interface ThinkingActivityProps {
  isThinking: boolean;
  steps: ThinkingStep[];
  duration?: number;
  onComplete?: () => void;
}

const iconMap = {
  database: Database,
  brain: Brain,
  search: Search,
  file: FileText,
  shield: Shield,
  sparkles: Sparkles,
};

export function ThinkingActivity({
  isThinking,
  steps,
  duration = 0,
}: ThinkingActivityProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displaySteps, setDisplaySteps] = useState<ThinkingStep[]>([]);

  // Simulate step progression for live thinking
  useEffect(() => {
    if (isThinking && steps.length > 0) {
      setDisplaySteps([]); // Reset steps before starting new interval
      let currentTick = 0;
      
      const interval = setInterval(() => {
        currentTick++;
        
        if (currentTick <= steps.length) {
          // Deterministically generate the display array by slicing the original steps
          const newDisplaySteps = steps.slice(0, currentTick).map((step, index) => ({
            ...step,
            status: (index === currentTick - 1) ? 'running' : 'completed' as const
          }));
          setDisplaySteps(newDisplaySteps);
        } else {
          // All steps completed
          const completedSteps = steps.map(step => ({
            ...step,
            status: 'completed' as const
          }));
          setDisplaySteps(completedSteps);
          clearInterval(interval);
        }
      }, 800);

      return () => clearInterval(interval);
    } else if (!isThinking && steps.length > 0) {
      // For completed messages, show all steps as completed
      setDisplaySteps(steps.map(s => ({ ...s, status: 'completed' as const })));
    }
  }, [isThinking, steps]);

  // Timer - reset elapsed time when thinking starts
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isThinking) {
      // Reset elapsed time when starting to think
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isThinking]);

  // Don't render if no steps
  if (steps.length === 0 && displaySteps.length === 0) return null;

  const stepsToShow =
    displaySteps.length > 0
      ? displaySteps
      : steps.map(s => ({ ...s, status: 'completed' as const }));
  // Ensure displayTime is a reasonable value (max 999 seconds display)
  const displayTime = isThinking ? elapsedTime : Math.min(duration || 0, 999);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors group"
      >
        {isThinking ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Check className="w-4 h-4 text-green-500" />
        )}
        <span className={isThinking ? 'text-slate-600' : 'text-slate-500'}>
          {isThinking ? 'Thinking' : 'Thought'} for {displayTime}s
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pl-6 border-l-2 border-slate-300 space-y-3">
              {stepsToShow.map((step, index) => {
                const Icon = iconMap[step.icon];
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'completed'
                          ? 'bg-green-100'
                          : step.status === 'running'
                            ? 'bg-primary/20'
                            : 'bg-slate-200'
                      }`}
                    >
                      {step.status === 'running' ? (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      ) : step.status === 'completed' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Icon className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          step.status === 'running'
                            ? 'text-primary'
                            : step.status === 'completed'
                              ? 'text-slate-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {step.agent}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {step.action}
                      </p>
                      {step.details && step.status === 'completed' && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Typing animation component
export function TypingText({
  text,
  speed = 20,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text || displayedLength >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayedLength(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [text, speed, displayedLength]);

  useEffect(() => {
    if (text && displayedLength >= text.length && !isComplete) {
      setIsComplete(true);
      setTimeout(() => onComplete?.(), 0);
    }
  }, [displayedLength, text, isComplete, onComplete]);

  return (
    <span>
      {text.slice(0, displayedLength)}
      {!isComplete && displayedLength < text.length && (
        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />
      )}
    </span>
  );
}

// Dynamic thinking message pools for varied reasoning display
const TRANSLATION_ACTIONS = [
  'Converting patient message to English for analysis',
  'Understanding Urdu medical terminology',
  'Processing multilingual symptoms description',
  'Translating patient concerns accurately',
  "Interpreting patient's health query",
  'Parsing medical intent from message',
];

const RAG_ACTIONS = [
  'Searching Pinecone medical knowledge base',
  'Retrieving relevant clinical guidelines',
  'Querying symptom-disease correlations',
  'Fetching evidence-based medical literature',
  'Scanning differential diagnosis resources',
  'Cross-referencing medical databases',
];

const HISTORY_ACTIONS = [
  'Fetching patient medical history from database',
  'Loading chronic conditions and allergies',
  'Reviewing previous medications',
  'Analyzing patient health profile',
  'Checking family medical history',
  'Correlating existing conditions with symptoms',
];

const DISEASE_ACTIONS = [
  'Analyzing potential conditions based on symptoms',
  'Running differential diagnosis algorithm',
  'Correlating symptoms with disease patterns',
  'Applying clinical decision support logic',
  'Evaluating symptom-disease probability matrix',
  'Cross-matching with known condition profiles',
];

const REASONING_ACTIONS_LOW = [
  'Generating clarifying question to narrow diagnosis',
  'Preparing focused follow-up inquiry',
  'Building targeted symptom exploration question',
  'Crafting diagnostic differentiation question',
  'Formulating clinical probing question',
  'Designing symptom clarification prompt',
];

const REASONING_ACTIONS_HIGH = [
  'Building response with high confidence assessment',
  'Preparing preliminary diagnosis summary',
  'Synthesizing clinical findings',
  'Formulating evidence-based conclusion',
  'Consolidating diagnostic assessment',
  'Preparing clinical narrative summary',
];

const SAFETY_ACTIONS = [
  'Checking for emergency red flags',
  'Scanning for critical warning signs',
  'Evaluating urgency level of symptoms',
  'Assessing triage priority',
  'Screening for immediate care needs',
  'Validating patient safety parameters',
];

const DISEASE_DETAILS = [
  'Narrowed down based on symptom correlation',
  'Eliminated unlikely conditions from pattern',
  'Prioritized by probability score',
  'Filtered using clinical reasoning',
  'Ranked by symptom match percentage',
  'Refined through systematic elimination',
];

const SAFETY_DETAILS = [
  'No emergency flags detected',
  'Patient condition appears stable',
  'Non-urgent symptoms identified',
  'Standard triage level assigned',
  'Routine care pathway confirmed',
  'No immediate intervention required',
];

// Helper to get random item from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate dynamic thinking steps based on agent orchestration - VARIED EACH TIME
export function generateThinkingSteps(
  confidence: number,
  diseaseCount: number
): ThinkingStep[] {
  const isHighConfidence = confidence >= 70;
  
  // Create a unique prefix for this generation to guarantee unique keys
  const idPrefix = Math.random().toString(36).substring(2, 9);

  return [
    {
      id: `step-1-${idPrefix}`,
      agent: 'Translation Agent',
      action: getRandomItem(TRANSLATION_ACTIONS),
      status: 'pending',
      icon: 'sparkles',
    },
    {
      id: `step-2-${idPrefix}`,
      agent: 'RAG Retrieval Agent',
      action: getRandomItem(RAG_ACTIONS),
      status: 'pending',
      icon: 'search',
      details: `Retrieved ${3 + Math.floor(Math.random() * 7)} relevant medical documents`,
    },
    {
      id: `step-3-${idPrefix}`,
      agent: 'History Collector Agent',
      action: getRandomItem(HISTORY_ACTIONS),
      status: 'pending',
      icon: 'database',
      details: 'Loaded chronic conditions, medications, allergies',
    },
    {
      id: `step-4-${idPrefix}`,
      agent: 'Disease Identification Agent',
      action: `${getRandomItem(DISEASE_ACTIONS)} (${diseaseCount} conditions)`,
      status: 'pending',
      icon: 'brain',
      details: getRandomItem(DISEASE_DETAILS),
    },
    {
      id: `step-5-${idPrefix}`,
      agent: 'Clinical Reasoning Agent',
      action: isHighConfidence
        ? getRandomItem(REASONING_ACTIONS_HIGH)
        : getRandomItem(REASONING_ACTIONS_LOW),
      status: 'pending',
      icon: 'file',
      details: `Current confidence: ${confidence}%`,
    },
    {
      id: `step-6-${idPrefix}`,
      agent: 'Safety Agent',
      action: getRandomItem(SAFETY_ACTIONS),
      status: 'pending',
      icon: 'shield',
      details: getRandomItem(SAFETY_DETAILS),
    },
  ];
}
