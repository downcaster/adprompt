/**
 * @file Video generation controls component
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, Video, Loader2 } from "lucide-react";

interface GenerationControlsProps {
  canGenerate: boolean;
  regenLimit: number;
  setRegenLimit: (limit: number) => void;
  isDrafting: boolean;
  isGenerating: boolean;
  handleGenerate: (withCritique: boolean) => Promise<void>;
}

export function GenerationControls({
  canGenerate,
  regenLimit,
  setRegenLimit,
  isDrafting,
  isGenerating,
  handleGenerate,
}: GenerationControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🚀 Generate Video</CardTitle>
        <CardDescription>
          {canGenerate
            ? "Ready to generate! Choose draft or full critique workflow."
            : "Complete the steps above to enable generation"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="regen-limit">Regeneration Limit</Label>
            <div className="flex items-center gap-3">
              <Input
                id="regen-limit"
                type="number"
                min="1"
                max="10"
                value={regenLimit}
                onChange={(e) =>
                  setRegenLimit(Number.parseInt(e.target.value, 10) || 5)
                }
                className="w-24"
              />
              <p className="text-sm text-muted-foreground">
                Max iterations if critique fails ({regenLimit}x)
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => handleGenerate(false)}
            disabled={true}
            className="h-auto py-4 opacity-50 cursor-not-allowed"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Generate Draft (WIP)</div>
              <div className="text-xs font-normal text-muted-foreground">
                Coming soon - use critique instead
              </div>
            </div>
          </Button>
          <Button
            onClick={() => handleGenerate(true)}
            disabled={!canGenerate}
            className="h-auto py-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating &
                Critiquing...
              </>
            ) : (
              <>
                <Video className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Generate & Critique</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    Full workflow with feedback loop
                  </div>
                </div>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

