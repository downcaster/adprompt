/**
 * @file Results display component with latest result and history carousel
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import { Loader2, Maximize2 } from "lucide-react";
import { ScorecardRecord } from "@/types/api";
import { formatDistanceToNow } from "date-fns";

interface ResultsDisplayProps {
  scorecards: ScorecardRecord[] | undefined;
  openContinueIterationModal: (scorecard: ScorecardRecord) => void;
  isContinuingIteration: boolean;
}

// Helper to build full URLs for frames
const buildFrameUrl = (framePath: string): string => {
  if (framePath.startsWith("http")) return framePath;
  return `http://localhost:3000/${framePath}`;
};

export function ResultsDisplay({
  scorecards,
  openContinueIterationModal,
  isContinuingIteration,
}: ResultsDisplayProps) {
  const [expandedFrameUrl, setExpandedFrameUrl] = useState<string | null>(null);

  if (!scorecards || scorecards.length === 0) {
    return null;
  }

  const latestScorecard = scorecards[0];

  return (
    <>
      {/* Latest Result */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Result</CardTitle>
          <CardDescription>
            Iteration {latestScorecard.iteration} ·{" "}
            {new Date(latestScorecard.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={
                latestScorecard.overallStatus === "pass"
                  ? "default"
                  : "destructive"
              }
            >
              {latestScorecard.overallStatus.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openContinueIterationModal(latestScorecard)}
              disabled={isContinuingIteration}
            >
              {isContinuingIteration ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Iterating...
                </>
              ) : (
                "Continue Iterating"
              )}
            </Button>
          </div>

          {/* Video and Frames Split Layout */}
          <div className="flex gap-4">
            {/* Video - 3/4 width */}
            <div className="flex-[3]">
              <video
                src={
                  latestScorecard.videoUrl.startsWith("http")
                    ? latestScorecard.videoUrl
                    : `http://localhost:3000${latestScorecard.videoUrl}`
                }
                controls
                autoPlay
                loop
                muted
                className="w-full rounded-md border"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Frames - 1/4 width */}
            {latestScorecard.framePaths && latestScorecard.framePaths.length > 0 && (
              <div className="flex-[1] space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Key Frames
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {latestScorecard.framePaths.map((framePath, idx) => (
                    <button
                      key={idx}
                      onClick={() => setExpandedFrameUrl(buildFrameUrl(framePath))}
                      className="relative aspect-video rounded border overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
                    >
                      <img
                        src={buildFrameUrl(framePath)}
                        alt={`Frame ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {latestScorecard.scorecard.scores.map((score) => (
              <div
                key={score.dimension}
                className="rounded-md border p-3 flex flex-col justify-between min-h-[120px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{score.dimension}</span>
                    <Badge
                      variant={
                        score.status === "pass" ? "outline" : "destructive"
                      }
                    >
                      {(score.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {score.evidence.summary}
                  </p>
                </div>
                <Progress value={score.score * 100} className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History Carousel */}
      {scorecards.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>History ({scorecards.length} iterations)</CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full">
              <CarouselContent>
                {scorecards.slice(1).map((record) => (
                  <CarouselItem key={record.id}>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">
                            Iteration {record.iteration}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(record.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openContinueIterationModal(record)}
                            disabled={isContinuingIteration}
                          >
                            Continue
                          </Button>
                          <Badge
                            variant={
                              record.overallStatus === "pass"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {record.overallStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Video and Frames Split Layout for History */}
                      <div className="flex gap-3 mb-3">
                        {/* Video - 3/4 width */}
                        <div className="flex-[3]">
                          <video
                            src={
                              record.videoUrl.startsWith("http")
                                ? record.videoUrl
                                : `http://localhost:3000${record.videoUrl}`
                            }
                            controls
                            className="w-full rounded-md border"
                            style={{ maxHeight: "300px" }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>

                        {/* Frames - 1/4 width */}
                        {record.framePaths && record.framePaths.length > 0 && (
                          <div className="flex-[1]">
                            <div className="grid grid-cols-2 gap-1.5">
                              {record.framePaths.map((framePath, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setExpandedFrameUrl(buildFrameUrl(framePath))}
                                  className="relative aspect-video rounded border overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
                                >
                                  <img
                                    src={buildFrameUrl(framePath)}
                                    alt={`Frame ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <Maximize2 className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        {record.scorecard.scores.map((score) => (
                          <div
                            key={`${record.id}-${score.dimension}`}
                            className="rounded-md border px-3 py-2 flex flex-col justify-between min-h-[100px]"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs font-medium mb-1">
                                <span>{score.dimension}</span>
                                <span>{(score.score * 100).toFixed(0)}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {score.evidence.summary}
                              </p>
                            </div>
                            <Progress
                              value={score.score * 100}
                              className="mt-2 h-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselDots />
            </Carousel>
          </CardContent>
        </Card>
      )}

      {/* Expanded Frame Modal */}
      <Dialog open={!!expandedFrameUrl} onOpenChange={() => setExpandedFrameUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Frame Preview</DialogTitle>
          </DialogHeader>
          {expandedFrameUrl && (
            <img
              src={expandedFrameUrl}
              alt="Expanded frame"
              className="w-full rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

