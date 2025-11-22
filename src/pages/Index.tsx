import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Music, Video, Gift } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [friendName, setFriendName] = useState("");
  const [friendDescription, setFriendDescription] = useState("");
  const [giftTheme, setGiftTheme] = useState("");
  const [outputType, setOutputType] = useState("both");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!friendName || !friendDescription || !giftTheme) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    
    // Placeholder for AI generation - will need Lovable Cloud integration
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Generation complete! (Demo mode - connect Lovable Cloud for real generation)");
    }, 2000);
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
            Transform your birthday wishes into unforgettable personalized videos and songs. 
            Describe your friend, choose a theme, and let AI create magic.
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

            {/* Friend Description */}
            <div className="space-y-3">
              <Label htmlFor="friendDescription" className="text-lg font-semibold">
                Tell us about them
              </Label>
              <Textarea
                id="friendDescription"
                placeholder="Describe their personality, interests, hobbies, favorite things... The more details, the more personal the gift!"
                value={friendDescription}
                onChange={(e) => setFriendDescription(e.target.value)}
                className="min-h-32 text-base border-2 focus:border-primary transition-all resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Example: "Loves hiking and indie music, always laughing, obsessed with coffee"
              </p>
            </div>

            {/* Gift Theme */}
            <div className="space-y-3">
              <Label htmlFor="giftTheme" className="text-lg font-semibold">
                What's the theme?
              </Label>
              <Input
                id="giftTheme"
                placeholder="Birthday celebration, friendship tribute, inside joke..."
                value={giftTheme}
                onChange={(e) => setGiftTheme(e.target.value)}
                className="text-lg h-12 border-2 focus:border-primary transition-all"
              />
            </div>

            {/* Output Type Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">What should we create?</Label>
              <RadioGroup value={outputType} onValueChange={setOutputType} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label htmlFor="video" className="cursor-pointer">
                  <Card className={`p-6 text-center hover:border-primary transition-all duration-300 hover:shadow-lg ${outputType === 'video' ? 'border-primary border-2 bg-primary/5' : 'border-2'}`}>
                    <RadioGroupItem value="video" id="video" className="sr-only" />
                    <Video className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-lg mb-1">Video</h3>
                    <p className="text-sm text-muted-foreground">A personalized video montage</p>
                  </Card>
                </label>

                <label htmlFor="song" className="cursor-pointer">
                  <Card className={`p-6 text-center hover:border-accent transition-all duration-300 hover:shadow-lg ${outputType === 'song' ? 'border-accent border-2 bg-accent/5' : 'border-2'}`}>
                    <RadioGroupItem value="song" id="song" className="sr-only" />
                    <Music className="w-10 h-10 mx-auto mb-3 text-accent" />
                    <h3 className="font-semibold text-lg mb-1">Song</h3>
                    <p className="text-sm text-muted-foreground">A custom birthday song</p>
                  </Card>
                </label>

                <label htmlFor="both" className="cursor-pointer">
                  <Card className={`p-6 text-center hover:border-secondary transition-all duration-300 hover:shadow-lg ${outputType === 'both' ? 'border-secondary border-2 bg-secondary/5' : 'border-2'}`}>
                    <RadioGroupItem value="both" id="both" className="sr-only" />
                    <div className="flex justify-center gap-2 mb-3">
                      <Video className="w-8 h-8 text-primary" />
                      <Music className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">Both</h3>
                    <p className="text-sm text-muted-foreground">The ultimate gift combo</p>
                  </Card>
                </label>
              </RadioGroup>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Creating your gift...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Gift
                </span>
              )}
            </Button>

            {/* Info Note */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>
                🎉 Your personalized gift will be generated using AI
              </p>
              <p className="mt-1 text-xs">
                Connect Lovable Cloud to enable real video and song generation
              </p>
            </div>
          </div>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <Card className="p-6 text-center border-2 hover:border-primary transition-all hover:shadow-lg">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI creates unique, personalized content
            </p>
          </Card>

          <Card className="p-6 text-center border-2 hover:border-accent transition-all hover:shadow-lg">
            <Gift className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold text-lg mb-2">Truly Personal</h3>
            <p className="text-sm text-muted-foreground">
              Every gift is one-of-a-kind, tailored to your friend
            </p>
          </Card>

          <Card className="p-6 text-center border-2 hover:border-secondary transition-all hover:shadow-lg">
            <Music className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold text-lg mb-2">Easy & Fast</h3>
            <p className="text-sm text-muted-foreground">
              Just describe, click, and share your amazing gift
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
