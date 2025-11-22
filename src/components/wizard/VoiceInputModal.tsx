import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import { Room } from "livekit-client";

interface VoiceInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranscription: (text: string) => void;
}

function VoiceAssistantContent({
  onTranscription,
  onClose,
}: {
  onTranscription: (text: string) => void;
  onClose: () => void;
}) {
  const [transcribedText, setTranscribedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const voiceAssistant = useVoiceAssistant();

  useEffect(() => {
    // Listen for agent messages (transcriptions)
    // The agent will echo back what the user said
    if (voiceAssistant.agent) {
      const transcript = voiceAssistant.agent.transcript;

      if (transcript && transcript.length > 0) {
        // Get the last agent message (which contains the transcription)
        const agentMessages = transcript.filter((msg) => msg.role === "assistant");
        if (agentMessages.length > 0) {
          const lastMessage = agentMessages[agentMessages.length - 1];
          if (lastMessage.content) {
            setTranscribedText(lastMessage.content);
            setIsEditing(true); // Automatically enable editing when transcription arrives
          }
        }
      }
    }
  }, [voiceAssistant.agent?.transcript]);

  const handleConfirm = () => {
    if (transcribedText.trim()) {
      onTranscription(transcribedText);
      onClose();
      toast.success("Voice input added!");
    } else {
      toast.error("No transcription available. Please speak and wait for transcription.");
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-col items-center gap-4">
        {voiceAssistant.state === "connecting" && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Connecting to voice assistant...</p>
          </div>
        )}

        {voiceAssistant.state === "listening" && (
          <>
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <div className="w-20 h-20 rounded-full bg-primary/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
            <BarVisualizer
              state={voiceAssistant.state}
              barCount={5}
              trackRef={voiceAssistant.audioTrack}
              className="w-48"
            />
            <p className="text-sm text-muted-foreground">Listening... Speak naturally about your friend</p>
          </>
        )}

        {voiceAssistant.state === "thinking" && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing your voice...</p>
          </div>
        )}

        {voiceAssistant.state === "speaking" && (
          <>
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
              <Mic className="w-12 h-12 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Transcribing...</p>
          </>
        )}
      </div>

      <RoomAudioRenderer />
      <VoiceAssistantControlBar controls={{ leave: false }} />

      {transcribedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Transcription</h4>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Preview" : "Edit"}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              className="min-h-[100px] text-sm"
              placeholder="Edit your transcription..."
            />
          ) : (
            <div className="p-3 bg-muted rounded-lg text-sm">{transcribedText}</div>
          )}
          <Button onClick={handleConfirm} className="w-full gap-2">
            <Check className="w-4 h-4" />
            Use This Text
          </Button>
        </div>
      )}
    </div>
  );
}

export const VoiceInputModal = ({ open, onOpenChange, onTranscription }: VoiceInputModalProps) => {
  const [connectionDetails, setConnectionDetails] = useState<{ token: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && !connectionDetails) {
      connectToLiveKit();
    }
  }, [open]);

  const connectToLiveKit = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // Generate a unique room name for this session
      const roomName = `transcription-${Date.now()}`;
      const participantName = `user-${Math.random().toString(36).substring(7)}`;

      const response = await fetch(`${API_URL}/api/livekit-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_name: roomName,
          participant_name: participantName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get LiveKit token");
      }

      const data = await response.json();
      setConnectionDetails({ token: data.token, url: data.url });
    } catch (error) {
      console.error("Error connecting to LiveKit:", error);
      toast.error("Failed to connect to voice service. Please try again.");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConnectionDetails(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
          <DialogDescription>
            Tell us about your friend using your voice. The AI will transcribe your words in real-time.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Connecting to voice service...</p>
          </div>
        )}

        {connectionDetails && !isLoading && (
          <LiveKitRoom
            token={connectionDetails.token}
            serverUrl={connectionDetails.url}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={handleClose}
          >
            <VoiceAssistantContent onTranscription={onTranscription} onClose={handleClose} />
          </LiveKitRoom>
        )}

        <p className="text-xs text-muted-foreground text-center">Powered by LiveKit & AI Transcription</p>
      </DialogContent>
    </Dialog>
  );
};
