interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const WizardProgress = ({ currentStep, totalSteps, stepLabels }: WizardProgressProps) => {
  const currentStepLabel = stepLabels[currentStep - 1];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-foreground">
          {currentStepLabel}
        </span>
      </div>
      <div className="flex gap-2 w-full">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber <= currentStep;

          return (
            <div
              key={stepNumber}
              className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  isCompleted ? 'bg-primary' : 'bg-transparent'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
