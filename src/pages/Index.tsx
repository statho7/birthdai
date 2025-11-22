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
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [includeVideo, setIncludeVideo] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicFilename, setMusicFilename] = useState<string | null>(null);

  const personalityTraits = [
    { emoji: "🎮", label: "Gamer", value: "gaming enthusiast" },
    { emoji: "📚", label: "Bookworm", value: "book lover" },
    { emoji: "🎵", label: "Music Lover", value: "music enthusiast" },
    { emoji: "⚽", label: "Sports Fan", value: "sports enthusiast" },
    { emoji: "🍕", label: "Foodie", value: "food lover" },
    { emoji: "☕", label: "Coffee Addict", value: "coffee enthusiast" },
    { emoji: "🎨", label: "Creative", value: "artistic and creative" },
    { emoji: "🤓", label: "Nerdy", value: "nerdy and intellectual" },
    { emoji: "😂", label: "Funny", value: "funny and humorous" },
    { emoji: "🧘", label: "Zen", value: "calm and zen" },
    { emoji: "🎉", label: "Party Person", value: "party enthusiast" },
    { emoji: "💪", label: "Fitness Guru", value: "fitness enthusiast" },
  ];

  const themes = [
    { emoji: "🎂", label: "Classic Birthday", value: "classic birthday celebration" },
    { emoji: "🎊", label: "Party Time", value: "party celebration" },
    { emoji: "🌟", label: "Milestone", value: "milestone birthday" },
    { emoji: "🎸", label: "Rock Star", value: "rock star theme" },
    { emoji: "🏖️", label: "Tropical", value: "tropical vacation vibe" },
    { emoji: "🎮", label: "Gaming", value: "gaming theme" },
    { emoji: "🍰", label: "Sweet & Cute", value: "sweet and cute celebration" },
    { emoji: "🚀", label: "Adventure", value: "adventure and exploration" },
    { emoji: "💐", label: "Elegant", value: "elegant and sophisticated" },
    { emoji: "🦄", label: "Magical", value: "magical and fantasy" },
  ];

  const toggleTrait = (value: string) => {
    setSelectedTraits((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const generatePrompt = () => {
    const traitsText = selectedTraits.join(", ");
    const themeObj = themes.find((t) => t.value === selectedTheme);
    const themeLabel = themeObj ? themeObj.label : "Birthday";

    return `You are a professional songwriter who writes catchy, personalized birthday songs.
You always follow the structure requested by the user and adapt tone, style, rhythm, and rhyme patterns to the chosen genre.
Keep lyrics clean, joyful, and easy to sing.
Make the song feel genuinely personal by using all provided user details in a natural, creative way.

Write a personalized birthday song.

Friend's Name: ${friendName}
Personality Traits: ${traitsText}
Theme: ${themeLabel}
Preferred Style/Genre: Pop/Upbeat
Vibe: Fun and celebratory

Song Requirements:
- 2 verses, 1 catchy chorus, and an optional bridge.
- Make the chorus easy to sing along to.
- Make the lyrics feel personal by weaving in the details above without overusing them.
- Follow the rhythm and tone of the chosen genre.
- Keep it warm, memorable, and fun.

Now write the full song.`;
  };

  const handleGenerate = async () => {
    if (!friendName || selectedTraits.length === 0 || !selectedTheme) {
      toast.error("Please complete all selections");
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
        <Card className="max-w-3xl mx-auto p-8 shadow-2xl border-2 backdrop-blur-sm bg-card/95 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
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

            {/* Personality Traits Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Tell us about them</Label>
                <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {personalityTraits.map((trait) => (
                  <button
                    key={trait.value}
                    type="button"
                    onClick={() => toggleTrait(trait.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      selectedTraits.includes(trait.value)
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-3xl">{trait.emoji}</span>
                    <span className="text-xs font-medium text-center">{trait.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">What's the theme?</Label>
                <p className="text-sm text-muted-foreground mt-1">Pick one that fits best</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => setSelectedTheme(theme.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      selectedTheme === theme.value
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <span className="text-3xl">{theme.emoji}</span>
                    <span className="text-xs font-medium text-center">{theme.label}</span>
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
