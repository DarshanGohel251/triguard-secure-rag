import { useState, useEffect, useRef } from 'react';

export interface StageInfo {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'blocked' | 'fallback';
}

const DEFAULT_STAGES: Omit<StageInfo, 'status'>[] = [
  { id: 1, name: 'Identity & Injection Firewall', description: 'Scans prompt for adversarial jailbreak & injection patterns' },
  { id: 2, name: 'Deterministic RBAC Scope', description: 'Validates persona role & department clearance rings' },
  { id: 3, name: 'Scoped Vector Retrieval', description: 'Retrieves dense semantic embeddings only from authorized partitions' },
  { id: 4, name: 'Cross-Domain Leak Guard', description: 'Verifies zero cross-department or classified candidate leakage' },
  { id: 5, name: 'Grounded Context Synthesis', description: 'Safe LLM completion constrained strictly to verified context' },
  { id: 6, name: 'Citation & Ledger Sealing', description: 'Validates page-level citations and commits immutable audit hash' },
];

export function useSequentialReveal(
  isActive: boolean,
  finalStatus: string = 'AUTHORIZED',
  isFallback: boolean = false,
  minStageDelayMs: number = 220
) {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [stages, setStages] = useState<StageInfo[]>(() =>
    DEFAULT_STAGES.map((s) => ({ ...s, status: 'pending' }))
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setCurrentStageIndex(0);
      setStages(DEFAULT_STAGES.map((s) => ({ ...s, status: 'pending' })));
      return;
    }

    // Reset stages to pending
    let currentIdx = 0;
    setCurrentStageIndex(0);

    const stepInterval = () => {
      if (currentIdx >= DEFAULT_STAGES.length) {
        return;
      }

      setStages((prev) =>
        prev.map((s, idx) => {
          if (idx < currentIdx) {
            // Previously passed
            return { ...s, status: 'passed' };
          }
          if (idx === currentIdx) {
            // Check if final stage or blocked
            if (finalStatus === 'INJECTION_BLOCKED' && s.id === 1) {
              return { ...s, status: 'blocked' };
            }
            if (finalStatus === 'RESTRICTED' && s.id === 2) {
              return { ...s, status: 'blocked' };
            }
            if (isFallback && s.id === 5) {
              return { ...s, status: 'fallback' };
            }
            return { ...s, status: 'running' };
          }
          return { ...s, status: 'pending' };
        })
      );

      // Check if blocked early
      if (finalStatus === 'INJECTION_BLOCKED' && currentIdx === 0) {
        setTimeout(() => {
          setStages((prev) =>
            prev.map((s, idx) => (idx === 0 ? { ...s, status: 'blocked' } : s))
          );
        }, minStageDelayMs);
        return;
      }

      if (finalStatus === 'RESTRICTED' && currentIdx === 1) {
        setTimeout(() => {
          setStages((prev) =>
            prev.map((s, idx) => (idx === 1 ? { ...s, status: 'blocked' } : s))
          );
        }, minStageDelayMs);
        return;
      }

      currentIdx++;
      setCurrentStageIndex(currentIdx);

      if (currentIdx < DEFAULT_STAGES.length) {
        timerRef.current = setTimeout(stepInterval, minStageDelayMs);
      } else {
        // Complete all stages
        setStages((prev) =>
          prev.map((s) => ({
            ...s,
            status: isFallback && s.id === 5 ? 'fallback' : 'passed',
          }))
        );
      }
    };

    timerRef.current = setTimeout(stepInterval, 80);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, finalStatus, isFallback, minStageDelayMs]);

  return { stages, currentStageIndex, isComplete: currentStageIndex >= DEFAULT_STAGES.length };
}
