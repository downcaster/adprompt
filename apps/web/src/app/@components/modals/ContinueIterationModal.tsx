/**
 * @file Continue iteration modal component
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ScorecardRecord } from "@/types/api";

interface ContinueIterationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedScorecard: ScorecardRecord | null;
  iterationCount: number;
  setIterationCount: (count: number) => void;
  promptNotes: string;
  setPromptNotes: (notes: string) => void;
  handleContinue: () => Promise<void>;
  isIterating: boolean;
}

export function ContinueIterationModal({
  open,
  onOpenChange,
  selectedScorecard,
  iterationCount,
  setIterationCount,
  promptNotes,
  setPromptNotes,
  handleContinue,
  isIterating,
}: ContinueIterationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Continue Iterating from Iteration {selectedScorecard?.iteration}
          </DialogTitle>
          <DialogDescription>
            Create additional iterations building on this result's prompt and
            critique feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="continue-iterations">
              Number of Additional Iterations
            </Label>
            <Input
              id="continue-iterations"
              type="number"
              min="1"
              max="10"
              value={iterationCount}
              onChange={(e) =>
                setIterationCount(Number.parseInt(e.target.value, 10) || 3)
              }
            />
            <p className="text-xs text-muted-foreground">
              How many more iterations to try (max 10)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="continue-prompt-notes">
              Additional Prompt Notes (Optional)
            </Label>
            <Textarea
              id="continue-prompt-notes"
              placeholder="Add any specific instructions or refinements to guide the next iterations..."
              value={promptNotes}
              onChange={(e) => setPromptNotes(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the original caption. Add notes to refine the
              direction.
            </p>
          </div>

          {selectedScorecard && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-semibold">This will continue from:</p>
              <ul className="text-xs space-y-1">
                <li>
                  • Iteration {selectedScorecard.iteration} critique feedback
                </li>
                <li>
                  • Overall status:{" "}
                  <span className="font-medium">
                    {selectedScorecard.overallStatus}
                  </span>
                </li>
                <li>• Scores will inform the next generation prompts</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              setPromptNotes("");
            }}
            disabled={isIterating}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleContinue}
            disabled={isIterating}
          >
            {isIterating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iterating...
              </>
            ) : (
              `Start ${iterationCount} Iteration${iterationCount > 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

