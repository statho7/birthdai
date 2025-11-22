import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  nextLabel?: string;
}

export const StepNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canProceed,
  nextLabel = "Next",
}: StepNavigationProps) => {
  return (
    <div className="flex justify-between items-center gap-4 mt-8">
      {currentStep > 1 ? (
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      ) : (
        <div />
      )}
      
      {currentStep < totalSteps && (
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2 ml-auto"
        >
          {nextLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
