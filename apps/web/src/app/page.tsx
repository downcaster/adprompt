"use client";

import { type ComponentType, type SVGProps, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { zodResolver } from "@hookform/resolvers/zod";
import { Folder, Layers, Loader2, Palette, PlayCircle, UploadCloud, Video, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

import { cn } from "@/lib/utils";
import {
  BrandKit,
  CampaignBrief,
  PublishLogRecord,
  ScorecardRecord,
} from "@/types/api";
import {
  createBrandKit,
  createCampaign,
  createPublishLogEntry,
  generateAndCritique,
  generateOnce,
  listBrandKits,
  listCampaigns,
  listPublishLogs,
  listScorecardsByCampaign,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ModeToggle } from "@/components/mode-toggle";

const brandKitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  toneDescription: z.string().optional(),
  prohibitedPhrases: z.string().optional(),
  targetAudience: z.string().optional(),
  primaryCallToAction: z.string().optional(),
  manualHexColors: z.string().optional(),
});

type BrandKitFormValues = z.infer<typeof brandKitSchema>;

const campaignSchema = z.object({
  productDescription: z.string().min(1, "Description is required"),
  audience: z.string().min(1, "Audience is required"),
  callToAction: z.string().min(1, "CTA is required"),
  toneKeywords: z.string().optional(),
  regenLimit: z
    .number({ invalid_type_error: "Enter a number" })
    .min(1)
    .max(10)
    .default(5),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

const DEFAULT_SCORE_THRESHOLD = 0.8;

function useBrandKits() {
  return useSWR<BrandKit[]>("brand-kits", () => listBrandKits());
}

function useCampaigns(brandKitId: string | null) {
  return useSWR<CampaignBrief[]>(
    brandKitId ? ["campaigns", brandKitId] : null,
    () => listCampaigns(brandKitId as string),
  );
}

function useScorecards(campaignId: string | null) {
  return useSWR<ScorecardRecord[]>(
    campaignId ? ["scorecards", campaignId] : null,
    () => listScorecardsByCampaign(campaignId as string),
  );
}

function usePublishLogs(campaignId: string | null) {
  return useSWR<PublishLogRecord[]>(
    campaignId ? ["publish-logs", campaignId] : null,
    () => listPublishLogs(campaignId as string),
  );
}

export default function Page() {
  return <DashboardPage />;
}

function DashboardPage() {
  const { data: brandKits, mutate: mutateBrandKits, isLoading: loadingBrandKits } = useBrandKits();
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBrandKitId && brandKits && brandKits.length > 0) {
      setSelectedBrandKitId(brandKits[0].id);
    }
  }, [brandKits, selectedBrandKitId]);

  const { data: campaigns, mutate: mutateCampaigns } = useCampaigns(selectedBrandKitId);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBrandKitId && campaigns && campaigns.length > 0) {
      setSelectedCampaignId((prev) => prev ?? campaigns[0].id);
    } else {
      setSelectedCampaignId(null);
    }
  }, [selectedBrandKitId, campaigns]);

  const {
    data: scorecards,
    mutate: mutateScorecards,
  } = useScorecards(selectedCampaignId);
  const { data: publishLogs, mutate: mutatePublishLogs } = usePublishLogs(selectedCampaignId);

  const brandKitForm = useForm<BrandKitFormValues>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: {
      name: "",
      toneDescription: "",
      prohibitedPhrases: "",
      targetAudience: "",
      primaryCallToAction: "",
      manualHexColors: "",
    },
  });
  const campaignForm = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      productDescription: "",
      audience: "",
      callToAction: "",
      toneKeywords: "",
      regenLimit: 5,
    },
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [paletteFile, setPaletteFile] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [supportingAssets, setSupportingAssets] = useState<File[]>([]);
  const [caption, setCaption] = useState<string>("");
  const [scoreThreshold, setScoreThreshold] = useState<number>(DEFAULT_SCORE_THRESHOLD);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);

  const activeBrandKit = useMemo(
    () => brandKits?.find((kit) => kit.id === selectedBrandKitId) ?? null,
    [brandKits, selectedBrandKitId],
  );

  const activeCampaign = useMemo(
    () => campaigns?.find((campaign) => campaign.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId],
  );

  const latestScorecard = scorecards?.[0] ?? null;

  const handleBrandKitSubmit = brandKitForm.handleSubmit(async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.toneDescription) formData.append("toneDescription", values.toneDescription);
      if (values.prohibitedPhrases) formData.append("prohibitedPhrases", values.prohibitedPhrases);
      if (values.targetAudience) formData.append("targetAudience", values.targetAudience);
      if (values.primaryCallToAction) formData.append("primaryCallToAction", values.primaryCallToAction);
      if (values.manualHexColors) formData.append("manualHexColors", values.manualHexColors);
      if (logoFile) formData.append("logo", logoFile);
      if (paletteFile) formData.append("palette", paletteFile);

      await createBrandKit(formData);
      toast.success("Brand kit created");
      brandKitForm.reset();
      setLogoFile(null);
      setPaletteFile(null);
      await mutateBrandKits();
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Failed to create brand kit");
    }
  });

  const handleCampaignSubmit = campaignForm.handleSubmit(async (values) => {
    if (!selectedBrandKitId) {
      toast.error("Please select a brand kit first");
      return;
    }
    if (!productImage) {
      toast.error("A product image is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("brandKitId", selectedBrandKitId);
      formData.append("productDescription", values.productDescription);
      formData.append("audience", values.audience);
      formData.append("callToAction", values.callToAction);
      formData.append("regenLimit", values.regenLimit.toString());
      if (values.toneKeywords) formData.append("toneKeywords", values.toneKeywords);
      formData.append("product", productImage);
      supportingAssets.forEach((file) => formData.append("assets", file));

      const newCampaign = await createCampaign(formData);
      toast.success("Campaign brief created");
      campaignForm.reset();
      setProductImage(null);
      setSupportingAssets([]);
      await mutateCampaigns();
      setSelectedCampaignId(newCampaign.id);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Failed to create campaign");
    }
  });

  const handleGenerate = async (withCritique: boolean) => {
    if (!selectedBrandKitId || !selectedCampaignId) {
      toast.error("Select a brand kit and campaign first");
      return;
    }

    try {
      if (withCritique) {
        setIsGenerating(true);
        const payload = await generateAndCritique({
          brandKitId: selectedBrandKitId,
          campaignId: selectedCampaignId,
          caption,
          scoreThreshold,
        });
        toast.success(
          payload.final.passed
            ? "Video cleared all critique gates"
            : "Feedback ready—scores below target",
        );
        await mutateScorecards();
        await mutatePublishLogs();
      } else {
        setIsDrafting(true);
        await generateOnce({
          brandKitId: selectedBrandKitId,
          campaignId: selectedCampaignId,
          caption,
        });
        toast.success("Draft video generated—run critique when ready");
      }
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Generation failed");
    } finally {
      setIsGenerating(false);
      setIsDrafting(false);
    }
  };

  const handlePublishLog = async (platform: string) => {
    if (!selectedBrandKitId || !selectedCampaignId) {
      toast.error("Select a brand kit and campaign first");
      return;
    }
    try {
      const latest = scorecards?.[0];
      await createPublishLogEntry({
        brandKitId: selectedBrandKitId,
        campaignId: selectedCampaignId,
        scorecardId: latest?.id,
        platform,
        status: "published",
      });
      toast.success(`Logged publish event for ${platform}`);
      await mutatePublishLogs();
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Failed to log publish event");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-background via-background/90 to-background/70">
      <div className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">BrandAI Orchestrator</p>
              <h1 className="text-xl font-semibold leading-tight">Autonomous Ad Quality Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex">
              {process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user"}
            </Badge>
            <ModeToggle />
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1200px] gap-6 px-6 py-8 lg:grid-cols-[320px,1fr]">
        <aside className="space-y-6">
          <Card className="border-dashed border-primary/30 bg-background/60 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" /> Brand Kits
              </CardTitle>
              <CardDescription>
                Curate brand personality, palette, and guardrails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {loadingBrandKits && (
                  <Badge variant="secondary">Loading kits…</Badge>
                )}
                {brandKits?.map((kit) => (
                  <button
                    key={kit.id}
                    onClick={() => setSelectedBrandKitId(kit.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition",
                      kit.id === selectedBrandKitId
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/70 hover:border-primary/60 hover:bg-muted",
                    )}
                  >
                    <p className="text-sm font-semibold">{kit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(kit.derivedPaletteHex ?? []).slice(0, 2).join(" · ") || "Palette pending"}
                    </p>
                    <div className="mt-2 flex gap-1">
                      {(kit.derivedPaletteHex ?? []).slice(0, 5).map((hex, index) => (
                        <span
                          key={`${kit.id}-swatch-${hex}-${index}`}
                          className="h-3 w-6 rounded-full border border-border/70"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
                {brandKits && brandKits.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No brand kits yet – upload your creative DNA below.
                  </p>
                )}
              </div>

              <Form {...brandKitForm}>
                <form onSubmit={handleBrandKitSubmit} className="space-y-3">
                  <FormField
                    control={brandKitForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Running" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={brandKitForm.control}
                    name="toneDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice & tone</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Confident, human, relentlessly optimistic"
                            className="min-h-[72px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={brandKitForm.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target audience</FormLabel>
                          <FormControl>
                            <Input placeholder="Fitness enthusiasts" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={brandKitForm.control}
                      name="primaryCallToAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary CTA</FormLabel>
                          <FormControl>
                            <Input placeholder="Shop the drop" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={brandKitForm.control}
                    name="prohibitedPhrases"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prohibited phrases</FormLabel>
                        <FormControl>
                          <Textarea placeholder="No discount language, no health claims" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate phrases with commas.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={brandKitForm.control}
                    name="manualHexColors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palette HEX values</FormLabel>
                        <FormControl>
                          <Input placeholder="#1A1A1A, #FFE432" {...field} />
                        </FormControl>
                        <FormDescription>We&apos;ll blend these with palette uploads.</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="logo-upload">Logo</Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setLogoFile(file);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="palette-upload">Palette reference</Label>
                      <Input
                        id="palette-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setPaletteFile(file);
                        }}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={brandKitForm.formState.isSubmitting}>
                    {brandKitForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving kit…
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" /> Save brand kit
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="bg-background/60 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Folder className="h-4 w-4 text-primary" /> Campaign briefs
              </CardTitle>
              <CardDescription>Feed Veo with context-rich scenarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Form {...campaignForm}>
                <form onSubmit={handleCampaignSubmit} className="space-y-3">
                  <FormField
                    control={campaignForm.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product narrative</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nimbus Velocity sneakers – carbon plate, race-day energy"
                            className="min-h-[68px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={campaignForm.control}
                    name="audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audience</FormLabel>
                        <FormControl>
                          <Input placeholder="Urban marathoners" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={campaignForm.control}
                    name="callToAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call to action</FormLabel>
                        <FormControl>
                          <Input placeholder="Reserve your pair" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={campaignForm.control}
                    name="toneKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creative adjectives</FormLabel>
                        <FormControl>
                          <Input placeholder="explosive, cinematic, focused" {...field} />
                        </FormControl>
                        <FormDescription>Comma separated; informs Veo prompt remix.</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={campaignForm.control}
                    name="regenLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max regen passes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            {...field}
                            value={field.value}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Caps automated critique loop iterations.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="product-image">Product image (required)</Label>
                      <Input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setProductImage(file);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supporting-assets">Supporting assets</Label>
                      <Input
                        id="supporting-assets"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(event) => {
                          const files = event.target.files ? Array.from(event.target.files) : [];
                          setSupportingAssets(files);
                        }}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Optional lifestyle stills or alternate shots.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={campaignForm.formState.isSubmitting}>
                    {campaignForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving brief…
                      </>
                    ) : (
                      <>
                        <Layers className="mr-2 h-4 w-4" /> Save campaign brief
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-lg">
            <CardHeader className="pb-3">
              <CardDescription className="uppercase tracking-wide text-xs text-muted-foreground">
                Creative readiness overview
              </CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {activeBrandKit ? `${activeBrandKit.name} quality control` : "Select a brand kit to begin"}
              </CardTitle>
              <CardDescription className="text-sm">
                {activeCampaign
                  ? `Campaign focus: ${activeCampaign.productDescription}`
                  : "Activate a campaign to unlock generation controls."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <MetricTile
                label="Active campaigns"
                icon={Folder}
                value={campaigns?.length ?? 0}
                description="Briefs linked to this brand kit"
              />
              <MetricTile
                label="Last critique"
                icon={Video}
                value={latestScorecard ? formatDistanceToNow(new Date(latestScorecard.createdAt), { addSuffix: true }) : "—"}
                description={latestScorecard ? `Iteration ${latestScorecard.iteration}` : "Awaiting first generation"}
              />
              <MetricTile
                label="Pass rate"
                icon={Zap}
                value={computePassRate(scorecards)}
                description="Aggregated across stored critiques"
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Automated generation loop</CardTitle>
                  <CardDescription>
                    Trigger Veo and run Gemini-based critique with your guardrails.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Score threshold
                  </Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={1}
                    step={0.05}
                    value={scoreThreshold}
                    onChange={(event) => setScoreThreshold(Number(event.target.value))}
                    className="h-8 w-24"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr,220px]">
                <div className="space-y-3">
                  <Label htmlFor="caption">Caption guidance</Label>
                  <Textarea
                    id="caption"
                    placeholder="Lead with the carbon plate advantage, call out marathon PRs, close with Reserve Your Pair."
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    className="min-h-[90px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Caption and narrative cues are blended into the Veo prompt on every iteration.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleGenerate(false)}
                    disabled={isDrafting || isGenerating}
                  >
                    {isDrafting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting…
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" /> Generate draft
                      </>
                    )}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => handleGenerate(true)}
                    disabled={isGenerating || isDrafting}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Orchestrating critique…
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" /> Generate & critique
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {latestScorecard && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Latest scorecard</p>
                      <p className="text-xs text-muted-foreground">
                        Iteration {latestScorecard.iteration} · {new Date(latestScorecard.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={latestScorecard.overallStatus === "pass" ? "default" : "destructive"}>
                      Overall {latestScorecard.overallStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid gap-3 md:grid-cols-2">
                    {latestScorecard.scorecard.scores.map((score) => (
                      <div key={`${latestScorecard.id}-${score.dimension}`} className="rounded-md border px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{score.dimension}</span>
                          <Badge variant={score.status === "pass" ? "outline" : "destructive"}>
                            {(score.score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{score.evidence.summary}</p>
                        <Progress value={score.score * 100} className="mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="scorecards" className="space-y-4">
            <TabsList>
              <TabsTrigger value="scorecards" className="flex items-center gap-2">
                <Video className="h-4 w-4" /> Critique history
              </TabsTrigger>
              <TabsTrigger value="publish" className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" /> Publish log
              </TabsTrigger>
            </TabsList>
            <TabsContent value="scorecards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stored scorecards</CardTitle>
                  <CardDescription>Every Veo iteration with Gemini audit trail.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[260px]">
                    <div className="space-y-4 pr-4">
                      {scorecards?.map((record) => (
                        <div key={record.id} className="rounded-lg border bg-background/80 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">Iteration {record.iteration}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge variant={record.overallStatus === "pass" ? "default" : "destructive"}>
                              {record.overallStatus.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            {record.scorecard.scores.map((score) => (
                              <div key={`${record.id}-${score.dimension}`} className="rounded-md border px-3 py-2">
                                <div className="flex items-center justify-between text-xs font-medium">
                                  <span>{score.dimension}</span>
                                  <span>{(score.score * 100).toFixed(0)}%</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {score.evidence.summary}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(!scorecards || scorecards.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No scorecards yet. Generate and critique to populate this timeline.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="publish" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Publish timeline</CardTitle>
                      <CardDescription>Record when creative hits production channels.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {["Instagram", "TikTok", "YouTube"].map((platform) => (
                        <Button
                          key={platform}
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublishLog(platform)}
                        >
                          Mark {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[240px]">
                    <div className="space-y-3 pr-3">
                      {publishLogs?.map((log) => (
                        <div key={log.id} className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium">{log.platform}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                              {log.externalUrl ? (
                                <>
                                  {" · "}
                                  <a
                                    href={log.externalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline-offset-4 hover:underline"
                                  >
                                    View post
                                  </a>
                                </>
                              ) : null}
                            </p>
                          </div>
                          <Badge variant="outline">{log.status}</Badge>
                        </div>
                      ))}
                      {(!publishLogs || publishLogs.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No publish activity recorded yet.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

function MetricTile({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function computePassRate(scorecards?: ScorecardRecord[] | null) {
  if (!scorecards || scorecards.length === 0) return "—";
  const passes = scorecards.filter((record) => record.overallStatus === "pass").length;
  return `${Math.round((passes / scorecards.length) * 100)}%`; }
