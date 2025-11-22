import { Card, CardContent } from "@/components/ui/card";
import { Play, Music, Link2, Video } from "lucide-react";

export const MagicExample = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20 hover-scale">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">See what you'll get ✨</h3>
        
        <div className="relative aspect-square rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer hover-scale" />
          </div>
          <div className="text-white font-bold text-center px-4">
            <p className="text-2xl mb-1">Happy 30th,</p>
            <p className="text-3xl">Alex!</p>
          </div>
        </div>

        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <Music className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span>45-second custom song</span>
          </li>
          <li className="flex items-start gap-3">
            <Video className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span>Sung in your chosen style</span>
          </li>
          <li className="flex items-start gap-3">
            <Link2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span>Shareable link & video</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
