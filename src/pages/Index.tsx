import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Music, Video, Gift, Loader2, Download, Mic, Zap, Heart } from "lucide-react";
import { toast } from "sonner";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { StepNavigation } from "@/components/wizard/StepNavigation";
import { PromptChip } from "@/components/wizard/PromptChip";
import { SummaryCard } from "@/components/wizard/SummaryCard";
import { MagicExample } from "@/components/wizard/MagicExample";
import { VoiceInputModal } from "@/components/wizard/VoiceInputModal";
import { GeneratingOverlay } from "@/components/wizard/GeneratingOverlay";

const Index = () => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  
  // Form state
  const [friendName, setFriendName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [friendDescription, setFriendDescription] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [customVibe, setCustomVibe] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [includeVideo, setIncludeVideo] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicFilename, setMusicFilename] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFilename, setVideoFilename] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const stepLabels = ["About them", "Song style", "Preview & Generate"];

  const relationships = [
    { emoji: "👯", label: "Best Friend", value: "best friend" },
    { emoji: "🏡", label: "Family/Sibling", value: "family member or sibling" },
    { emoji: "💑", label: "Partner/Spouse", value: "romantic partner or spouse" },
    { emoji: "👴", label: "Parent/Grandparent", value: "parent or grandparent" },
    { emoji: "💼", label: "Colleague", value: "colleague or coworker" },
    { emoji: "🎓", label: "Classmate", value: "classmate or school friend" },
  ];

  const vibes = [
    { emoji: "💝", label: "Heartfelt", value: "heartfelt and touching" },
    { emoji: "😂", label: "Funny Roast", value: "funny roast with playful teasing" },
    { emoji: "😬", label: "Cringe", value: "cringe and awkward in a fun way" },
    { emoji: "🎉", label: "Epic Party", value: "epic party celebration" },
  ];

  const genres = [
    { emoji: "🎵", label: "Pop · Taylor Swift", value: "Pop", imagePath: "/genre_images/popImageUrl.png" },
    { emoji: "🎤", label: "Hip Hop · 50 Cent", value: "Hip Hop", imagePath: "/genre_images/hiphopImageUrl.png" },
    { emoji: "🎸", label: "Rock · Queen", value: "Rock", imagePath: "/genre_images/rockImageUrl.png" },
    { emoji: "🎧", label: "EDM · Calvin Harris", value: "EDM / Dance", imagePath: "/genre_images/edmImageUrl.png" },
    {
      emoji: "🎹",
      label: "Acoustic · Ed Sheeran",
      value: "Acoustic / Singer-Songwriter",
      imagePath: "/genre_images/acousticImageUrl.png",
    },
    { emoji: "⚡", label: "Hyphy · E-40", value: "Hyphy", imagePath: "/genre_images/hyphyImageUrl.png" },
  ];

  // Wizard navigation
  const canProceedFromStep1 = friendName.trim() !== "" && relationship !== "" && friendDescription.trim().length >= 20;
  const canProceedFromStep2 = selectedVibe !== "" && selectedGenre !== "";

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep === 1 && !canProceedFromStep1) {
      toast.error("Please complete all fields. Description must be at least 20 characters.");
      return;
    }
    if (currentStep === 2 && !canProceedFromStep2) {
      toast.error("Please select both a vibe and a genre.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePromptChipClick = (promptText: string) => {
    setFriendDescription((prev) => {
      const separator = prev.trim() ? " " : "";
      return prev + separator + promptText;
    });
  };

  const handleVoiceTranscription = (text: string) => {
    setFriendDescription(text);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      setUploadedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast.success("Image uploaded successfully! 📸");
    }
  };

  const generatePrompt = () => {
    const vibeText = vibes.find((v) => v.value === selectedVibe)?.label || "";
    const genreText = genres.find((g) => g.value === selectedGenre)?.value || "";

    return `You are a professional songwriter who writes catchy, personalized birthday songs.
You always follow the structure requested by the user and adapt tone, style, rhythm, and rhyme patterns to the chosen genre.
Keep lyrics clean, joyful, and easy to sing.
Make the song feel genuinely personal by using all provided user details in a natural, creative way.

Write a personalized birthday song.

Friend's Name: ${friendName}
Your Relationship: ${relationship}
About Them: ${friendDescription}
Song Vibe: ${vibeText}
Genre: ${genreText}

Song Requirements:
- 2 verses, 1 catchy chorus, and an optional bridge.
- Make the chorus easy to sing along to.
- Use the relationship context and personal details to make the song authentic and meaningful.
- Match the tone and energy to the specified vibe.
- Follow the rhythm and style of the chosen genre.
- Keep it warm, memorable, and fun.

Now write the full song.`;
  };

  const handleGenerate = async () => {
    if (!friendName || !relationship || !friendDescription || !selectedVibe || !selectedGenre) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsGenerating(true);
    setMusicUrl(null);
    setMusicFilename(null);
    setVideoUrl(null);
    setVideoFilename(null);

    const prompt = generatePrompt();
    console.log("Generated Prompt for Music Generation:");
    console.log(prompt);

    try {
      // Call the backend API to generate music
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/generate-music`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          duration_seconds: 30,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate music");
      }

      const data = await response.json();

      if (data.success && data.file_url) {
        const fullUrl = `${API_URL}${data.file_url}`;
        setMusicUrl(fullUrl);
        setMusicFilename(data.filename);
        toast.success("Music generated successfully! 🎵");

        // Automatically generate video if the option is checked
        if (includeVideo) {
          // Trigger video generation automatically
          await generateVideo(fullUrl, API_URL);
        }
      } else {
        throw new Error("Music generation failed");
      }
    } catch (error) {
      console.error("Error generating music:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate music. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async (audioUrl: string, apiUrl: string) => {
    setIsGeneratingVideo(true);
    setVideoUrl(null);
    setVideoFilename(null);

    try {
      let imageUrl: string;

      // Use custom uploaded image or genre image
      if (uploadedImage) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("image", uploadedImage);

        const uploadResponse = await fetch(`${apiUrl}/api/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.image_url;
        setIsUploadingImage(false);
      } else {
        // Use the genre image instead
        const selectedGenreData = genres.find((g) => g.value === selectedGenre);
        if (!selectedGenreData?.imagePath) {
          throw new Error("No genre image found");
        }

        // Fetch the genre image and upload it
        setIsUploadingImage(true);
        const imageResponse = await fetch(selectedGenreData.imagePath);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append("image", imageBlob, `genre_${selectedGenre}.png`);

        const uploadResponse = await fetch(`${apiUrl}/api/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload genre image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.image_url;
        setIsUploadingImage(false);
      }

      const response = await fetch(`${apiUrl}/api/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          image_url: imageUrl,
          resolution: "720p",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate video");
      }

      const data = await response.json();

      if (data.success && data.file_url) {
        const fullUrl = `${apiUrl}${data.file_url}`;
        setVideoUrl(fullUrl);
        setVideoFilename(data.filename);
        toast.success("Video generated successfully! 🎥");
      } else {
        throw new Error("Video generation failed");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate video. Please try again.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!musicUrl) {
      toast.error("Please generate music first");
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    await generateVideo(musicUrl, API_URL);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <GeneratingOverlay visible={isGenerating || isGeneratingVideo} />
      <VoiceInputModal
        open={voiceModalOpen}
        onOpenChange={setVoiceModalOpen}
        onTranscription={handleVoiceTranscription}
      />
      
      {/* Decorative elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
          {/* Magic Example - Left Column */}
          <div className="hidden lg:block lg:sticky lg:top-8">
            <MagicExample />
          </div>

          {/* Main Content - Center/Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-3">
                Birthday Songs with AI
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Generate custom birthday songs!
              </p>
              <p className="text-sm text-muted-foreground">
                Answer 3 quick questions, get a custom birthday song in under a minute.
              </p>
            </div>

            {/* Wizard Card */}
            <Card className="shadow-2xl border-2 backdrop-blur-sm bg-card/95 wizard-fade-in">
              <CardHeader>
                <WizardProgress
                  currentStep={currentStep}
                  totalSteps={3}
                  stepLabels={stepLabels}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: About them */}
                {currentStep === 1 && (
                  <div className="space-y-6 wizard-slide-in">
                    <div className="space-y-3">
                      <Label htmlFor="friendName" className="text-lg font-semibold">
                        Who's the lucky person?
                      </Label>
                      <Input
                        id="friendName"
                        placeholder="Enter their name"
                        value={friendName}
                        onChange={(e) => setFriendName(e.target.value)}
                        className="text-lg h-12 border-2 focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg font-semibold">What's your relationship?</Label>
                        <p className="text-sm text-muted-foreground mt-1">Pick one.</p>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {relationships.map((rel) => (
                          <button
                            key={rel.value}
                            type="button"
                            onClick={() => setRelationship(rel.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover-scale ${
                              relationship === rel.value
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="text-3xl">{rel.emoji}</span>
                            <span className="text-xs font-medium text-center">{rel.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="friendDescription" className="text-lg font-semibold">
                            Tell us about them
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">What makes them them?</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setVoiceModalOpen(true)}
                          className="gap-2"
                        >
                          <Mic className="w-4 h-4" />
                          Talk instead
                        </Button>
                      </div>
                      <Textarea
                        id="friendDescription"
                        placeholder="E.g. 'Lena loves climbing, sends 3am memes, and sings terrible karaoke but we love her anyway.'"
                        value={friendDescription}
                        onChange={(e) => setFriendDescription(e.target.value)}
                        className="min-h-[120px] text-base border-2 focus:border-primary transition-all resize-none"
                      />
                      <p className={`text-xs ${friendDescription.trim().length >= 20 ? 'text-muted-foreground' : 'text-destructive'}`}>
                        {friendDescription.trim().length}/20 characters minimum
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <PromptChip
                          icon={Zap}
                          label="Funny habits"
                          promptText="Some funny habits: "
                          onClick={handlePromptChipClick}
                        />
                        <PromptChip
                          icon={Gift}
                          label="Best memory"
                          promptText="My best memory with them: "
                          onClick={handlePromptChipClick}
                        />
                        <PromptChip
                          icon={Heart}
                          label="Why they're special"
                          promptText="What makes them special: "
                          onClick={handlePromptChipClick}
                        />
                      </div>
                    </div>

                    <StepNavigation
                      currentStep={currentStep}
                      totalSteps={3}
                      onNext={handleNext}
                      onBack={handleBack}
                      canProceed={canProceedFromStep1}
                    />
                  </div>
                )}

                {/* Step 2: Song style */}
                {currentStep === 2 && (
                  <div className="space-y-6 wizard-slide-in">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg font-semibold">What's the vibe?</Label>
                        <p className="text-sm text-muted-foreground mt-1">Choose the mood of the song</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {vibes.map((vibe) => (
                          <button
                            key={vibe.value}
                            type="button"
                            onClick={() => setSelectedVibe(vibe.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover-scale ${
                              selectedVibe === vibe.value
                                ? "border-accent bg-accent/10 shadow-md"
                                : "border-border hover:border-accent/50"
                            }`}
                          >
                            <span className="text-3xl">{vibe.emoji}</span>
                            <span className="text-xs font-medium text-center">{vibe.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-lg font-semibold">What's the genre?</Label>
                        <p className="text-sm text-muted-foreground mt-1">Choose the musical style</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {genres.map((genre) => (
                          <button
                            key={genre.value}
                            type="button"
                            onClick={() => setSelectedGenre(genre.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover-scale overflow-hidden ${
                              selectedGenre === genre.value
                                ? "border-secondary bg-secondary/10 shadow-md"
                                : "border-border hover:border-secondary/50"
                            }`}
                          >
                            <div className="w-full h-24 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                              <img src={genre.imagePath} alt={genre.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xs font-medium text-center">{genre.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <StepNavigation
                      currentStep={currentStep}
                      totalSteps={3}
                      onNext={handleNext}
                      onBack={handleBack}
                      canProceed={canProceedFromStep2}
                    />
                  </div>
                )}

                {/* Step 3: Preview & Generate */}
                {currentStep === 3 && (
                  <div className="space-y-6 wizard-slide-in">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Review Your Gift</h3>
                      <SummaryCard
                        friendName={friendName}
                        relationship={relationship}
                        description={friendDescription}
                        vibe={selectedVibe}
                        genre={selectedGenre}
                        onEdit={goToStep}
                      />
                    </div>

                    <Card className="p-6 bg-secondary/5 border-2 border-secondary/20">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="w-5 h-5 text-secondary" />
                              <h3 className="font-semibold text-lg">Add Video Gift</h3>
                              <Badge variant="secondary" className="text-xs">
                                Optional
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Generate a personalized video montage with your song
                            </p>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={includeVideo}
                              onChange={(e) => {
                                setIncludeVideo(e.target.checked);
                                if (!e.target.checked) {
                                  setUploadedImage(null);
                                  setImagePreview(null);
                                }
                              }}
                              className="w-5 h-5 rounded border-2 border-secondary checked:bg-secondary"
                            />
                          </label>
                        </div>

                        {includeVideo && (
                          <div className="space-y-3 animate-fade-in">
                            <Label className="text-sm font-medium">Custom Image (Optional)</Label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {imagePreview && (
                              <div className="mt-3">
                                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all hover-scale relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isGenerating ? (
                          <>
                            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                            ✨ Generating your song...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Gift 🎁
                          </>
                        )}
                      </span>
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Powered by OpenAI · ElevenLabs · VEED · LiveKit
                    </p>

                    <StepNavigation
                       currentStep={currentStep}
                       totalSteps={3}
                       onNext={handleNext}
                       onBack={handleBack}
                       canProceed={true}
                     />
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Results Section */}
             {(musicUrl || videoUrl) && (
               <Card className="shadow-2xl border-2 backdrop-blur-sm bg-card/95 animate-fade-in">
                 <CardHeader>
                   <h2 className="text-2xl font-bold flex items-center gap-2">
                     <Sparkles className="w-6 h-6 text-primary" />
                     Your Personalized Gift
                   </h2>
                   <p className="text-muted-foreground">Your custom birthday song is ready!</p>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   {musicUrl && (
                     <div className="space-y-3">
                       <Label className="text-lg font-semibold">🎵 Your Song</Label>
                       <audio controls className="w-full" src={musicUrl}>
                         Your browser does not support the audio element.
                       </audio>
                       <Button
                         variant="outline"
                         className="w-full gap-2"
                         onClick={() => {
                           const a = document.createElement('a');
                           a.href = musicUrl;
                           a.download = musicFilename || `birthday-song-${friendName}.mp3`;
                           a.click();
                         }}
                       >
                         <Download className="w-4 h-4" />
                         Download Song
                       </Button>
                     </div>
                   )}

                   {videoUrl && (
                     <div className="space-y-3">
                       <Label className="text-lg font-semibold">🎬 Your Video</Label>
                       <video controls className="w-full rounded-lg" src={videoUrl}>
                         Your browser does not support the video element.
                       </video>
                       <Button
                         variant="outline"
                         className="w-full gap-2"
                         onClick={() => {
                           const a = document.createElement('a');
                           a.href = videoUrl;
                           a.download = videoFilename || `birthday-video-${friendName}.mp4`;
                           a.click();
                         }}
                       >
                         <Download className="w-4 h-4" />
                         Download Video
                       </Button>
                     </div>
                   )}

                   {!videoUrl && includeVideo && musicUrl && (
                     <div className="space-y-3">
                       <Button
                         onClick={handleGenerateVideo}
                         disabled={isGeneratingVideo}
                         className="w-full gap-2"
                         variant="secondary"
                       >
                         {isGeneratingVideo ? (
                           <>
                             <Loader2 className="w-4 h-4 animate-spin" />
                             Generating Video...
                           </>
                         ) : (
                           <>
                             <Video className="w-4 h-4" />
                             Generate Video Now
                           </>
                         )}
                       </Button>
                     </div>
                   )}
                 </CardContent>
               </Card>
             )}
           </div>
         </div>
       </div>
     </div>
   );
 };

 export default Index;
