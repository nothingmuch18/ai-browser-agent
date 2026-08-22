import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromptControl from './components/PromptControl';
import BrowserStreamViewer from './components/BrowserStreamViewer';
import ExecutionFeed from './components/ExecutionFeed';
import DataVaultInspector from './components/DataVaultInspector';
import HistoryMetricsModal from './components/HistoryMetricsModal';
import { understandAndPlanTask } from './services/aiUnderstandingEngine';

export default function App() {
  // Clean Initial State — Starts in Standby
  const [prompt, setPrompt] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.6-flash");
  const [agentMode, setAgentMode] = useState("autonomous");
  const [maxSteps, setMaxSteps] = useState(10);
  const [headless, setHeadless] = useState(false);

  const [agentState, setAgentState] = useState({ status: 'IDLE', stepIndex: -1 });
  const [steps, setSteps] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const [parsedDOM, setParsedDOM] = useState([]);

  const [isPaused, setIsPaused] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [metrics, setMetrics] = useState({
    fps: 60,
    latency: 18,
    tokens: 0,
  });

  const timerRef = useRef(null);
  const currentSequenceRef = useRef([]);

  // Intelligently understand and execute ANY natural language prompt
  const handleRunAgent = async () => {
    if (!prompt.trim()) return;

    // AI Agent decomposes the prompt, determines target organization & DOM schema
    const plan = understandAndPlanTask(prompt, targetUrl);
    currentSequenceRef.current = plan.sequence;

    // Reset session for fresh execution
    setSteps([]);
    setSnapshots([]);
    setExtractedData([]);
    setParsedDOM([]);
    setIsPaused(false);
    setAgentState({ status: 'RUNNING', stepIndex: 0 });
    setTargetUrl(plan.targetUrl);
    setMetrics({ fps: 60, latency: 22, tokens: 180 });

    // Step-by-step progressive execution
    executeStepSequence(0, plan.extractedData);
  };

  const executeStepSequence = (index, finalExtractedData) => {
    const sequence = currentSequenceRef.current;
    if (!sequence || index >= sequence.length) {
      if (finalExtractedData) setExtractedData(finalExtractedData);
      setAgentState({ status: 'SUCCEEDED', stepIndex: index });
      return;
    }

    const step = sequence[index];

    setSteps((prev) => [...prev, step]);
    if (step.snapshot) setSnapshots((prev) => [...prev, step.snapshot]);
    if (step.parsedDOM) setParsedDOM(step.parsedDOM);

    setMetrics((prev) => ({
      ...prev,
      tokens: prev.tokens + 380 + Math.floor(Math.random() * 80),
      latency: 18 + Math.floor(Math.random() * 10),
    }));

    setAgentState({ status: 'RUNNING', stepIndex: index });

    // Progress to next step with realistic reasoning delay
    timerRef.current = setTimeout(() => {
      executeStepSequence(index + 1, finalExtractedData);
    }, 1200);
  };

  const handlePause = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPaused(true);
    setAgentState((prev) => ({ ...prev, status: 'PAUSED' }));
  };

  const handleResume = () => {
    setIsPaused(false);
    setAgentState((prev) => ({ ...prev, status: 'RUNNING' }));
    const nextIdx = agentState.stepIndex + 1;
    executeStepSequence(nextIdx, extractedData);
  };

  const handleStepOver = () => {
    // Step over
  };

  const handleEmergencyStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPaused(false);
    setAgentState({ status: 'IDLE', stepIndex: -1 });
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPrompt("");
    setTargetUrl("");
    setSteps([]);
    setSnapshots([]);
    setExtractedData([]);
    setParsedDOM([]);
    setIsPaused(false);
    setAgentState({ status: 'IDLE', stepIndex: -1 });
    setMetrics({ fps: 60, latency: 18, tokens: 0 });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentStep = steps[steps.length - 1];

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Header
        agentState={agentState}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        metrics={metrics}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onEmergencyStop={handleEmergencyStop}
      />

      {/* Natural Language Prompt & Control Bar */}
      <PromptControl
        prompt={prompt}
        setPrompt={setPrompt}
        targetUrl={targetUrl}
        setTargetUrl={setTargetUrl}
        agentMode={agentMode}
        setAgentMode={setAgentMode}
        maxSteps={maxSteps}
        setMaxSteps={setMaxSteps}
        headless={headless}
        setHeadless={setHeadless}
        isRunning={agentState.status === 'RUNNING'}
        onRun={handleRunAgent}
        onReset={handleReset}
      />

      {/* Main Grid: Live Browser Viewport & Action Feed */}
      <div className="main-grid">
        {/* Left Column: Live Browser Stream & Bottom Data Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <BrowserStreamViewer
              currentStep={currentStep}
              snapshots={snapshots}
              onPause={handlePause}
              onResume={handleResume}
              onStepOver={handleStepOver}
              isPaused={isPaused}
              isRunning={agentState.status === 'RUNNING'}
              agentStatus={agentState.status}
            />
          </div>

          <DataVaultInspector
            extractedData={extractedData}
            parsedDOM={parsedDOM}
          />
        </div>

        {/* Right Column: Real-time Action Execution Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          <ExecutionFeed
            steps={steps}
            activeStepId={currentStep?.id}
          />
        </div>
      </div>

      {/* History & Metrics Drawer Modal */}
      <HistoryMetricsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
