import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PromptChipProps {
  icon: LucideIcon;
  label: string;
  promptText: string;
  onClick: (text: string) => void;
}

export const PromptChip = ({ icon: Icon, label, promptText, onClick }: PromptChipProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onClick(promptText)}
      className="gap-2 hover-scale"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
};
