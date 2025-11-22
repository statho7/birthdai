import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Music, Video, Gift, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
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

  const relationships = [
    { emoji: "👯", label: "Best Friend", value: "best friend" },
    { emoji: "👨‍👩‍👧", label: "Family/Sibling", value: "family member or sibling" },
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
    { emoji: "🎵", label: "Pop · Taylor Swift", value: "Pop" },
    { emoji: "🎤", label: "Hip Hop · 50 Cent", value: "Hip Hop" },
    { emoji: "🎸", label: "Rock · Queen", value: "Rock" },
    { emoji: "🎧", label: "EDM · Calvin Harris", value: "EDM / Dance" },
    { emoji: "🎹", label: "Acoustic · Ed Sheeran", value: "Acoustic / Singer-Songwriter" },
    { emoji: "⚡", label: "Hyphy · E-40", value: "Hyphy" },
  ];

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

    if (includeVideo && !uploadedImage) {
      toast.error("Please upload an image for video generation");
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

      // Upload image to fal.ai if we have one
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
        throw new Error("No image uploaded");
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
      {/* Decorative elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 mb-6">
            <Gift className="w-8 h-8 text-primary" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              GiftGen
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your birthday wishes into unforgettable personalized videos and songs. Describe your friend,
            choose a theme, and let AI create magic.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="max-w-4xl mx-auto p-8 shadow-2xl border-2 backdrop-blur-sm bg-card/95 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="space-y-8">
            {/* Friend Name */}
            <div className="space-y-3">
              <Label htmlFor="friendName" className="text-lg font-semibold">
                Who's the lucky friend?
              </Label>
              <Input
                id="friendName"
                placeholder="Enter your friend's name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="text-lg h-12 border-2 focus:border-primary transition-all"
              />
            </div>

            {/* Relationship Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">What's your relationship?</Label>
                <p className="text-sm text-muted-foreground mt-1">Pick one that describes your connection</p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {relationships.map((rel) => (
                  <button
                    key={rel.value}
                    type="button"
                    onClick={() => setRelationship(rel.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
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

            {/* Friend Description */}
            <div className="space-y-3">
              <Label htmlFor="friendDescription" className="text-lg font-semibold">
                Tell us about them
              </Label>
              <Textarea
                id="friendDescription"
                placeholder="Describe your friend's personality, interests, hobbies, or any special memories you share..."
                value={friendDescription}
                onChange={(e) => setFriendDescription(e.target.value)}
                className="min-h-[120px] text-base border-2 focus:border-primary transition-all resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Be as detailed as you like - it makes the song more personal!
              </p>
            </div>

            {/* Vibe Selection */}
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
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
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

            {/* Genre Selection */}
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
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      selectedGenre === genre.value
                        ? "border-secondary bg-secondary/10 shadow-md"
                        : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <span className="text-3xl">{genre.emoji}</span>
                    <span className="text-xs font-medium text-center">{genre.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Add-on */}
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
                      Generate a personalized video montage in addition to the song (video will be 5 seconds to optimize
                      generation time)
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
                      className="w-5 h-5 rounded border-2 border-secondary text-secondary focus:ring-2 focus:ring-secondary cursor-pointer"
                    />
                  </label>
                </div>

                {/* Image Upload Section - shown when video is enabled */}
                {includeVideo && (
                  <div className="space-y-3 pt-4 border-t border-secondary/20">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="imageUpload" className="text-base font-semibold">
                        Upload Image for Video
                      </Label>
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a photo that will be animated with your birthday song
                    </p>

                    <div className="space-y-3">
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />

                      {imagePreview && (
                        <div className="relative rounded-lg overflow-hidden border-2 border-secondary/30">
                          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                          <button
                            onClick={() => {
                              setUploadedImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90 transition-all"
                          >
                            <span className="text-sm">✕</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isGeneratingVideo}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your gift...
                </span>
              ) : isGeneratingVideo ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating video...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Gift
                </span>
              )}
            </Button>

            {/* Music Player */}
            {musicUrl && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Music className="w-6 h-6 text-primary animate-pulse" />
                    <h3 className="text-lg font-semibold">Your Birthday Song is Ready!</h3>
                  </div>

                  <audio controls className="w-full" src={musicUrl}>
                    Your browser does not support the audio element.
                  </audio>

                  {musicFilename && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{musicFilename}</span>
                      <a
                        href={musicUrl}
                        download={musicFilename}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  )}

                  {/* Show video generation status */}
                  {includeVideo && isGeneratingVideo && !videoUrl && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-secondary/10 rounded-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                      <span className="text-sm font-medium">Creating video...</span>
                    </div>
                  )}

                  {/* Manual Generate Video Button - only show if video generation wasn't automatic */}
                  {includeVideo && !videoUrl && !isGeneratingVideo && musicUrl && (
                    <Button
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                      className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Retry Video Generation
                      </span>
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Video Player */}
            {videoUrl && (
              <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-secondary animate-pulse" />
                    <h3 className="text-lg font-semibold">Your Birthday Video is Ready!</h3>
                  </div>

                  <video controls className="w-full rounded-lg" src={videoUrl}>
                    Your browser does not support the video element.
                  </video>

                  {videoFilename && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{videoFilename}</span>
                      <a
                        href={videoUrl}
                        download={videoFilename}
                        className="flex items-center gap-2 text-secondary hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Info Note */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>🎉 Your personalized gift will be generated using AI</p>
              <p className="mt-1 text-xs">Generate a prompt to use with ChatGPT or OpenAI</p>
            </div>
          </div>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <Card className="p-6 text-center border-2 hover:border-primary transition-all hover:shadow-lg">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">Advanced AI creates unique, personalized content</p>
          </Card>

          <Card className="p-6 text-center border-2 hover:border-accent transition-all hover:shadow-lg">
            <Gift className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold text-lg mb-2">Truly Personal</h3>
            <p className="text-sm text-muted-foreground">Every gift is one-of-a-kind, tailored to your friend</p>
          </Card>

          <Card className="p-6 text-center border-2 hover:border-secondary transition-all hover:shadow-lg">
            <Music className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold text-lg mb-2">Easy & Fast</h3>
            <p className="text-sm text-muted-foreground">Just describe, click, and share your amazing gift</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
