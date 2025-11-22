import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const WizardProgress = ({ currentStep, totalSteps, stepLabels }: WizardProgressProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-start justify-center gap-4 mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 animate-scale-in" />
                  ) : (
                    <span className="font-semibold text-lg">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center transition-colors duration-300 whitespace-nowrap ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {stepLabels[index]}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div className="w-16 h-0.5 mt-6 bg-muted">
                  <div
                    className={`h-full transition-all duration-500 bg-primary`}
                    style={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};
