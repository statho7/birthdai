import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface SummaryCardProps {
  friendName: string;
  relationship: string;
  description: string;
  vibe: string;
  genre: string;
  onEdit: (step: number) => void;
}

export const SummaryCard = ({
  friendName,
  relationship,
  description,
  vibe,
  genre,
  onEdit,
}: SummaryCardProps) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">For</p>
            <p className="font-semibold text-lg">{friendName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Relationship</p>
            <p className="font-medium">{relationship}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">About them</p>
            <p className="text-sm">{truncateText(description, 100)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Style</p>
            <p className="font-medium">
              {vibe} • {genre}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
