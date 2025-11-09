/**
 * @file Caption input section component
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CaptionSectionProps {
  caption: string;
  setCaption: (caption: string) => void;
}

export function CaptionSection({ caption, setCaption }: CaptionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 What do you want to communicate?</CardTitle>
        <CardDescription>
          Provide narrative cues for the video. This caption guides Veo&apos;s
          generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="A runner conquering a mountain trail at sunrise, showcasing the power and comfort of our new Apex Carbon running shoes."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </CardContent>
    </Card>
  );
}

