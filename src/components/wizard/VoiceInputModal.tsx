import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface VoiceInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranscription: (text: string) => void;
}

export const VoiceInputModal = ({
  open,
  onOpenChange,
  onTranscription,
}: VoiceInputModalProps) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Integrate LiveKit for voice capture
    // For now, this is a stub
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Stop recording and transcribe with OpenAI Whisper
    // For demo purposes, provide sample text
    onTranscription(
      "They love hiking in the mountains and always bring their camera to capture stunning sunsets. They're the friend who sends memes at 3am and somehow always knows the perfect gift to give."
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
          <DialogDescription>
            Tell us about your friend using your voice. Click start to begin recording.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-8">
          {isRecording ? (
            <>
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-destructive/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-destructive animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">Recording...</p>
              <Button onClick={handleStopRecording} variant="destructive" className="gap-2">
                <Square className="w-4 h-4" />
                Stop & Transcribe
              </Button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Mic className="w-12 h-12 text-primary" />
              </div>
              <Button onClick={handleStartRecording} className="gap-2">
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Powered by LiveKit & OpenAI Whisper
        </p>
      </DialogContent>
    </Dialog>
  );
};
