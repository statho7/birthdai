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
    { emoji: "🎵", label: "Pop · Taylor Swift", value: "Pop" },
    { emoji: "🎤", label: "Hip Hop · 50 Cent", value: "Hip Hop" },
    { emoji: "🎸", label: "Rock · Queen", value: "Rock" },
    { emoji: "🎧", label: "EDM · Calvin Harris", value: "EDM / Dance" },
    { emoji: "🎹", label: "Acoustic · Ed Sheeran", value: "Acoustic / Singer-Songwriter" },
    { emoji: "⚡", label: "Hyphy · E-40", value: "Hyphy" },
  ];

  const generatePrompt = () => {
    const vibeText = vibes.find(v => v.value === selectedVibe)?.label || "";
    const genreText = genres.find(g => g.value === selectedGenre)?.value || "";
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Decorative elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 mb-4">
            <Gift className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent pb-3 leading-relaxed">
              Birthday Songs with AI
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generate custom birthday songs!
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="max-w-4xl mx-auto p-8 shadow-2xl border-2 backdrop-blur-sm bg-card/95 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="space-y-8">
            {/* Friend Name */}
            <div className="space-y-3">
              <Label htmlFor="friendName" className="text-lg font-semibold">
                Who's the lucky person?
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
              <p className="text-sm text-muted-foreground">Be as detailed as you like - it makes the song more personal!</p>
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
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold text-lg">Add Video Gift</h3>
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate a personalized video montage in addition to the song
                  </p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVideo}
                    onChange={(e) => setIncludeVideo(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-secondary text-secondary focus:ring-2 focus:ring-secondary cursor-pointer"
                  />
                </label>
              </div>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating your gift...
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
                </div>
              </Card>
            )}

            {/* Info Note */}
            <div className="text-center text-sm text-muted-foreground -mt-4">
              <p>🎉 Your personalized gift will be generated using AI</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Index;
