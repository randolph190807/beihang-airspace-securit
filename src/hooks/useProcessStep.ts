import { useState } from "react";

// 处置流程分步控制，动态切换下一步
export function useProcessStep(totalStep: number) {
  const [currentStep, setCurrentStep] = useState(1);

  // 下一步
  const next = () => {
    if (currentStep < totalStep - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // 重置流程
  const reset = () => setCurrentStep(0);

  // 判断当前步骤是否已完成
  const isFinished = (stepIndex: number) => stepIndex < currentStep;
  // 判断是否为当前激活步骤
  const isActive = (stepIndex: number) => stepIndex === currentStep;

  return {
    currentStep,
    next,
    reset,
    isFinished,
    isActive,
  };
}