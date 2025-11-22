import { Music, Sparkles } from "lucide-react";

interface GeneratingOverlayProps {
  visible: boolean;
}

export const GeneratingOverlay = ({ visible }: GeneratingOverlayProps) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="text-center space-y-6 animate-scale-in">
        <div className="relative">
          <div className="w-24 h-24 mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: "3s" }}>
              <Music className="w-16 h-16 text-primary/40" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Cooking up your custom track...</h3>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-8 bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="w-1 h-12 bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="w-1 h-6 bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
            <div className="w-1 h-10 bg-primary animate-pulse" style={{ animationDelay: "450ms" }} />
            <div className="w-1 h-8 bg-primary animate-pulse" style={{ animationDelay: "600ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
