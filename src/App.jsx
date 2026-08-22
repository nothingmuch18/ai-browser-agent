import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PromptControl from './components/PromptControl';
import BrowserStreamViewer from './components/BrowserStreamViewer';
import ExecutionFeed from './components/ExecutionFeed';
import DataVaultInspector from './components/DataVaultInspector';
import HistoryMetricsModal from './components/HistoryMetricsModal';
import { MOCK_STEPS_SEQUENCE } from './services/agentMockEngine';
import { apiClient } from './services/apiClient';

export default function App() {
  // Application State
  const [prompt, setPrompt] = useState("Search for 'Wireless Noise Canceling Headphones' on Amazon, filter by 4+ stars, and extract top product details.");
  const [targetUrl, setTargetUrl] = useState("https://www.amazon.com");
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
    latency: 24,
    tokens: 0,
  });

  const timerRef = useRef(null);

  // Run Agent Task Routine
  const handleRunAgent = async () => {
    // Reset session state
    setSteps([]);
    setSnapshots([]);
    setExtractedData([]);
    setParsedDOM([]);
    setIsPaused(false);
    setAgentState({ status: 'RUNNING', stepIndex: 0 });

    // Attempt live API call (falls back seamlessly if offline)
    await apiClient.startTask(prompt, targetUrl, { mode: agentMode, maxSteps, headless });

    // Launch Step-by-step real-time simulation sequence
    executeStepSequence(0);
  };

  const executeStepSequence = (index) => {
    if (index >= MOCK_STEPS_SEQUENCE.length) {
      setAgentState({ status: 'SUCCEEDED', stepIndex: index });
      return;
    }

    const step = MOCK_STEPS_SEQUENCE[index];

    setSteps((prev) => [...prev, step]);
    if (step.snapshot) setSnapshots((prev) => [...prev, step.snapshot]);
    if (step.extractedData) setExtractedData(step.extractedData);
    if (step.parsedDOM) setParsedDOM(step.parsedDOM);

    setMetrics((prev) => ({
      ...prev,
      tokens: prev.tokens + 450 + Math.floor(Math.random() * 100),
      latency: 20 + Math.floor(Math.random() * 15),
    }));

    setAgentState({ status: 'RUNNING', stepIndex: index });

    // Schedule next step after 1.4s delay unless paused
    timerRef.current = setTimeout(() => {
      executeStepSequence(index + 1);
    }, 1400);
  };

  // Pause / Resume / Step-Over Controls
  const handlePause = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPaused(true);
    setAgentState((prev) => ({ ...prev, status: 'PAUSED' }));
  };

  const handleResume = () => {
    setIsPaused(false);
    setAgentState((prev) => ({ ...prev, status: 'RUNNING' }));
    const nextIdx = agentState.stepIndex + 1;
    executeStepSequence(nextIdx);
  };

  const handleStepOver = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const nextIdx = agentState.stepIndex + 1;
    if (nextIdx < MOCK_STEPS_SEQUENCE.length) {
      const step = MOCK_STEPS_SEQUENCE[nextIdx];
      setSteps((prev) => [...prev, step]);
      if (step.snapshot) setSnapshots((prev) => [...prev, step.snapshot]);
      if (step.extractedData) setExtractedData(step.extractedData);
      if (step.parsedDOM) setParsedDOM(step.parsedDOM);
      setAgentState({ status: 'PAUSED', stepIndex: nextIdx });
    }
  };

  const handleEmergencyStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPaused(false);
    setAgentState({ status: 'IDLE', stepIndex: -1 });
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSteps([]);
    setSnapshots([]);
    setExtractedData([]);
    setParsedDOM([]);
    setIsPaused(false);
    setAgentState({ status: 'IDLE', stepIndex: -1 });
    setMetrics({ fps: 60, latency: 24, tokens: 0 });
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <BrowserStreamViewer
              currentStep={currentStep}
              snapshots={snapshots}
              onPause={handlePause}
              onResume={handleResume}
              onStepOver={handleStepOver}
              isPaused={isPaused}
              isRunning={agentState.status === 'RUNNING'}
            />
          </div>

          <DataVaultInspector
            extractedData={extractedData}
            parsedDOM={parsedDOM}
          />
        </div>

        {/* Right Column: Real-time Action Execution Feed */}
        <div style={{ height: '100%', minHeight: 0 }}>
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
