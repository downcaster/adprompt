"use client";

import { useState } from "react";
import useSWR from "swr";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Folder,
  Layers,
  Loader2,
  Palette,
  PlayCircle,
  UploadCloud,
  Video,
  Zap,
  Plus,
  CheckCircle2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  updateBrandKit,
  updateCampaign,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Form schemas
const brandKitSchema = z.object({
  name: z.string().min(1, { message: "Brand name is required" }),
  toneDescription: z
    .string()
    .min(1, { message: "Tone description is required" }),
  targetAudience: z.string().optional(),
  primaryCallToAction: z.string().optional(),
  prohibitedPhrases: z.string().optional(),
  manualHexColors: z.string().optional(),
});

const campaignSchema = z.object({
  productDescription: z
    .string()
    .min(1, { message: "Product description is required" }),
  audience: z.string().min(1, { message: "Audience is required" }),
  callToAction: z.string().min(1, { message: "Call to action is required" }),
  toneKeywords: z.string().min(1, { message: "Tone keywords required" }),
});

export default function DashboardPage() {
  // State
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | null>(
    null
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const [regenLimit, setRegenLimit] = useState(5);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandKitModalOpen, setBrandKitModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editBrandKitModalOpen, setEditBrandKitModalOpen] = useState(false);
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [editingBrandKit, setEditingBrandKit] = useState<BrandKit | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignBrief | null>(
    null
  );
  const [continueIterationModalOpen, setContinueIterationModalOpen] =
    useState(false);
  const [selectedScorecardForContinue, setSelectedScorecardForContinue] =
    useState<ScorecardRecord | null>(null);
  const [continueIterationCount, setContinueIterationCount] = useState(3);
  const [continuePromptNotes, setContinuePromptNotes] = useState("");
  const [isContinuingIteration, setIsContinuingIteration] = useState(false);

  // File uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [paletteFile, setPaletteFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);

  // Data fetching
  const { data: brandKits, mutate: mutateBrandKits } = useSWR<BrandKit[]>(
    "brandKits",
    listBrandKits
  );
  const { data: campaigns, mutate: mutateCampaigns } = useSWR<CampaignBrief[]>(
    selectedBrandKitId ? `campaigns-${selectedBrandKitId}` : null,
    () =>
      selectedBrandKitId
        ? listCampaigns(selectedBrandKitId)
        : Promise.resolve([])
  );
  const { data: scorecards, mutate: mutateScorecards } = useSWR<
    ScorecardRecord[]
  >(selectedCampaignId ? `scorecards-${selectedCampaignId}` : null, () =>
    selectedCampaignId
      ? listScorecardsByCampaign(selectedCampaignId)
      : Promise.resolve([])
  );

  // Forms
  const brandKitForm = useForm({
    resolver: zodResolver(brandKitSchema),
    defaultValues: {
      name: "",
      toneDescription: "",
      targetAudience: "",
      primaryCallToAction: "",
      prohibitedPhrases: "",
      manualHexColors: "",
    },
  });

  const campaignForm = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      productDescription: "",
      audience: "",
      callToAction: "",
      toneKeywords: "",
    },
  });

  // Selected items
  const selectedBrandKit = brandKits?.find(
    (kit) => kit.id === selectedBrandKitId
  );
  const selectedCampaign = campaigns?.find((c) => c.id === selectedCampaignId);
  const latestScorecard = scorecards?.[0];

  // Handlers
  const handleCreateBrandKit = async (
    values: z.infer<typeof brandKitSchema>
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("toneDescription", values.toneDescription);
      if (values.targetAudience)
        formData.append("targetAudience", values.targetAudience);
      if (values.primaryCallToAction)
        formData.append("primaryCallToAction", values.primaryCallToAction);
      if (values.prohibitedPhrases)
        formData.append("prohibitedPhrases", values.prohibitedPhrases);
      if (values.manualHexColors)
        formData.append("manualHexColors", values.manualHexColors);
      if (logoFile) formData.append("logo", logoFile);
      if (paletteFile) formData.append("palette", paletteFile);

      const kit = await createBrandKit(formData);
      toast.success("Brand kit created!");
      setSelectedBrandKitId(kit.id);
      setBrandKitModalOpen(false);
      brandKitForm.reset();
      setLogoFile(null);
      setPaletteFile(null);
      await mutateBrandKits();
    } catch (error) {
      toast.error((error as Error).message || "Failed to create brand kit");
    }
  };

  const handleCreateCampaign = async (
    values: z.infer<typeof campaignSchema>
  ) => {
    if (!selectedBrandKitId) {
      toast.error("Please select a brand kit first");
      return;
    }
    if (!productFile) {
      toast.error("Please upload a product image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("brandKitId", selectedBrandKitId);
      formData.append("productDescription", values.productDescription);
      formData.append("audience", values.audience);
      formData.append("callToAction", values.callToAction);
      formData.append("toneKeywords", values.toneKeywords);
      formData.append("regenLimit", "5"); // Default value, user can override in Generate section
      formData.append("product", productFile);

      const campaign = await createCampaign(formData);
      toast.success("Campaign created!");
      setSelectedCampaignId(campaign.id);
      setCampaignModalOpen(false);
      campaignForm.reset();
      setProductFile(null);
      await mutateCampaigns();
    } catch (error) {
      toast.error((error as Error).message || "Failed to create campaign");
    }
  };

  const handleGenerate = async (withCritique: boolean) => {
    if (!selectedBrandKitId || !selectedCampaignId) {
      toast.error("Please select both a brand kit and campaign");
      return;
    }

    try {
      if (withCritique) {
        setIsGenerating(true);
        const payload = await generateAndCritique({
          brandKitId: selectedBrandKitId,
          campaignId: selectedCampaignId,
          caption,
          regenLimit,
        });
        toast.success(
          payload.final.passed
            ? "Video cleared all critique gates"
            : "Feedback ready—scores below target"
        );
        await mutateScorecards();
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
      setIsDrafting(false);
      setIsGenerating(false);
    }
  };

  const canGenerate =
    selectedBrandKitId && selectedCampaignId && !isDrafting && !isGenerating;

  const handleContinueFromScorecard = async () => {
    if (
      !selectedScorecardForContinue ||
      !selectedBrandKitId ||
      !selectedCampaignId
    )
      return;

    // Close modal immediately so user can see "Iterating..." feedback
    setContinueIterationModalOpen(false);

    try {
      setIsContinuingIteration(true);
      const payload = await generateAndCritique({
        brandKitId: selectedBrandKitId,
        campaignId: selectedCampaignId,
        caption: continuePromptNotes || caption,
        regenLimit: continueIterationCount,
        scorecardId: selectedScorecardForContinue.id,
      });

      toast.success(
        `Continued from iteration ${selectedScorecardForContinue.iteration}! ${
          payload.final.passed ? "✓ Passed" : "More refinement needed"
        }`
      );

      await mutateScorecards();
      setSelectedScorecardForContinue(null);
      setContinuePromptNotes("");
      setContinueIterationCount(3);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Failed to continue iteration");
    } finally {
      setIsContinuingIteration(false);
    }
  };

  const openContinueIterationModal = (scorecard: ScorecardRecord) => {
    setSelectedScorecardForContinue(scorecard);
    setContinuePromptNotes("");
    setContinueIterationCount(3);
    setContinueIterationModalOpen(true);
  };

  const openEditBrandKitModal = (kit: BrandKit, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the brand kit
    setEditingBrandKit(kit);
    brandKitForm.reset({
      name: kit.name,
      toneDescription: kit.toneDescription ?? "",
      targetAudience: kit.targetAudience ?? "",
      primaryCallToAction: kit.primaryCallToAction ?? "",
      prohibitedPhrases: kit.prohibitedPhrases?.join(", ") ?? "",
      manualHexColors: kit.derivedPaletteHex?.join(", ") ?? "",
    });
    setEditBrandKitModalOpen(true);
  };

  const openEditCampaignModal = (
    campaign: CampaignBrief,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent selecting the campaign
    setEditingCampaign(campaign);
    campaignForm.reset({
      productDescription: campaign.productDescription,
      audience: campaign.audience,
      callToAction: campaign.callToAction,
      toneKeywords: campaign.toneKeywords.join(", "),
    });
    setEditCampaignModalOpen(true);
  };

  const handleUpdateBrandKit = async (
    values: z.infer<typeof brandKitSchema>
  ) => {
    if (!editingBrandKit) return;

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("toneDescription", values.toneDescription);
      if (values.targetAudience)
        formData.append("targetAudience", values.targetAudience);
      if (values.primaryCallToAction)
        formData.append("primaryCallToAction", values.primaryCallToAction);
      if (values.prohibitedPhrases)
        formData.append("prohibitedPhrases", values.prohibitedPhrases);
      if (values.manualHexColors)
        formData.append("manualHexColors", values.manualHexColors);
      if (logoFile) formData.append("logo", logoFile);
      if (paletteFile) formData.append("palette", paletteFile);

      await updateBrandKit(editingBrandKit.id, formData);
      toast.success("Brand kit updated!");
      setEditBrandKitModalOpen(false);
      setEditingBrandKit(null);
      brandKitForm.reset();
      setLogoFile(null);
      setPaletteFile(null);
      await mutateBrandKits();
    } catch (error) {
      toast.error((error as Error).message || "Failed to update brand kit");
    }
  };

  const handleUpdateCampaign = async (
    values: z.infer<typeof campaignSchema>
  ) => {
    if (!editingCampaign) return;

    try {
      const formData = new FormData();
      formData.append("productDescription", values.productDescription);
      formData.append("audience", values.audience);
      formData.append("callToAction", values.callToAction);
      formData.append("toneKeywords", values.toneKeywords);
      if (productFile) formData.append("product", productFile);

      await updateCampaign(editingCampaign.id, formData);
      toast.success("Campaign updated!");
      setEditCampaignModalOpen(false);
      setEditingCampaign(null);
      campaignForm.reset();
      setProductFile(null);
      await mutateCampaigns();
    } catch (error) {
      toast.error((error as Error).message || "Failed to update campaign");
    }
  };

  // Render brand kit form fields
  const renderBrandKitFormFields = (idSuffix: string = "") => (
    <>
      <FormField
        control={brandKitForm.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Name</FormLabel>
            <FormControl>
              <Input placeholder="Acme Co." {...field} />
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
            <FormLabel>Brand Voice/Tone</FormLabel>
            <FormControl>
              <Textarea placeholder="Bold, energetic, youthful" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={brandKitForm.control}
        name="targetAudience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Audience (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Young professionals" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={brandKitForm.control}
        name="primaryCallToAction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary CTA (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Shop Now" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={brandKitForm.control}
        name="prohibitedPhrases"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prohibited Phrases (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="cheap, discount, sale" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={brandKitForm.control}
        name="manualHexColors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Colors (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="#FF5733, #3498DB" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`logo-upload${idSuffix}`}>Logo (Optional)</Label>
          <Input
            id={`logo-upload${idSuffix}`}
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <Label htmlFor={`palette-upload${idSuffix}`}>
            Palette Image (Optional)
          </Label>
          <Input
            id={`palette-upload${idSuffix}`}
            type="file"
            accept="image/*"
            onChange={(e) => setPaletteFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </>
  );

  // Render campaign form fields
  const renderCampaignFormFields = (idSuffix: string = "") => (
    <>
      <FormField
        control={campaignForm.control}
        name="productDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Premium running shoes with carbon plate"
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
            <FormLabel>Target Audience</FormLabel>
            <FormControl>
              <Input placeholder="Marathon runners" {...field} />
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
            <FormLabel>Call to Action</FormLabel>
            <FormControl>
              <Input placeholder="Pre-order Now" {...field} />
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
            <FormLabel>Tone Keywords</FormLabel>
            <FormControl>
              <Input
                placeholder="energetic, motivational, premium"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <Label htmlFor={`product-upload${idSuffix}`}>
          Product Image (Required)
        </Label>
        <Input
          id={`product-upload${idSuffix}`}
          type="file"
          accept="image/*"
          required
          onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                ADPrompt
              </p>
              <h1 className="text-xl font-semibold">AI Ad Generator</h1>
            </div>
          </div>
          <ModeToggle />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl space-y-8 px-6 py-8">
        {/* Step 1: Caption */}
        <Card>
          <CardHeader>
            <CardTitle>📝 What do you want to communicate?</CardTitle>
            <CardDescription>
              Provide narrative cues for the video. This caption guides
              Veo&apos;s generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Lead with the carbon plate advantage, call out marathon PRs, close with Reserve Your Pair."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Step 2: Connect Brand Kit & Campaign */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Connect your brand & campaign
            </h2>
            <p className="text-sm text-muted-foreground">
              Both are required to generate videos
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Brand Kit Tile */}
            {selectedBrandKit ? (
              <Card className="border-2 border-primary flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Brand Kit</CardTitle>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-between gap-3">
                  <div className="rounded-lg bg-primary/5 p-3 space-y-1">
                    <p className="font-semibold text-base">
                      {selectedBrandKit.name}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedBrandKit.toneDescription}
                    </p>
                    {selectedBrandKit.derivedPaletteHex &&
                      selectedBrandKit.derivedPaletteHex.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {selectedBrandKit.derivedPaletteHex
                            .slice(0, 5)
                            .map((color, idx) => (
                              <div
                                key={idx}
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                        </div>
                      )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-auto h-10"
                    onClick={() => setSelectedBrandKitId(null)}
                  >
                    Change Brand Kit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    <CardTitle className="text-base">Brand Kit</CardTitle>
                  </div>
                  <CardDescription>Define your brand identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {brandKits && brandKits.length > 0 ? (
                    <>
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-2">
                          {brandKits.map((kit) => (
                            <div
                              key={kit.id}
                              className="relative w-full rounded-md border p-3 hover:bg-muted cursor-pointer group"
                              onClick={() => setSelectedBrandKitId(kit.id)}
                            >
                              <button
                                onClick={(e) => openEditBrandKitModal(kit, e)}
                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit brand kit"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <p className="font-medium pr-8">{kit.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {kit.toneDescription}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <Dialog
                        open={brandKitModalOpen}
                        onOpenChange={setBrandKitModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full h-10">
                            <Plus className="mr-2 h-4 w-4" /> Create New
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Brand Kit</DialogTitle>
                            <DialogDescription>
                              Define your brand&apos;s personality and visual
                              identity
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...brandKitForm}>
                            <form
                              onSubmit={brandKitForm.handleSubmit(
                                handleCreateBrandKit
                              )}
                              className="space-y-4"
                            >
                              {renderBrandKitFormFields()}
                              <Button
                                type="submit"
                                className="w-full"
                                disabled={brandKitForm.formState.isSubmitting}
                              >
                                {brandKitForm.formState.isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Creating...
                                  </>
                                ) : (
                                  "Create Brand Kit"
                                )}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Dialog
                      open={brandKitModalOpen}
                      onOpenChange={setBrandKitModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-20">
                          <Plus className="mr-2 h-5 w-5" /> Create Brand Kit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Brand Kit</DialogTitle>
                          <DialogDescription>
                            Define your brand&apos;s personality and visual
                            identity
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...brandKitForm}>
                          <form
                            onSubmit={brandKitForm.handleSubmit(
                              handleCreateBrandKit
                            )}
                            className="space-y-4"
                          >
                            {renderBrandKitFormFields("-2")}
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={brandKitForm.formState.isSubmitting}
                            >
                              {brandKitForm.formState.isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                  Creating...
                                </>
                              ) : (
                                "Create Brand Kit"
                              )}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Campaign Tile */}
            {selectedCampaign ? (
              <Card className="border-2 border-primary flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">
                        Campaign Brief
                      </CardTitle>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-between gap-3">
                  <div className="rounded-lg bg-primary/5 p-3 space-y-2">
                    <p className="font-semibold text-base line-clamp-2">
                      {selectedCampaign.productDescription}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Target:</span>{" "}
                        {selectedCampaign.audience}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">CTA:</span>{" "}
                        {selectedCampaign.callToAction}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-auto h-10"
                    onClick={() => setSelectedCampaignId(null)}
                  >
                    Change Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    <CardTitle className="text-base">Campaign Brief</CardTitle>
                  </div>
                  <CardDescription>Set campaign goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {campaigns && campaigns.length > 0 ? (
                    <>
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-2">
                          {campaigns.map((campaign) => (
                            <div
                              key={campaign.id}
                              className="relative w-full rounded-md border p-3 hover:bg-muted cursor-pointer group"
                              onClick={() => setSelectedCampaignId(campaign.id)}
                            >
                              <button
                                onClick={(e) =>
                                  openEditCampaignModal(campaign, e)
                                }
                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit campaign"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <p className="font-medium line-clamp-1 pr-8">
                                {campaign.productDescription}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {campaign.audience}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <Dialog
                        open={campaignModalOpen}
                        onOpenChange={setCampaignModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full h-10">
                            <Plus className="mr-2 h-4 w-4" /> Create New
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Campaign</DialogTitle>
                            <DialogDescription>
                              Define campaign goals and messaging
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...campaignForm}>
                            <form
                              onSubmit={campaignForm.handleSubmit(
                                handleCreateCampaign
                              )}
                              className="space-y-4"
                            >
                              {renderCampaignFormFields()}
                              <Button
                                type="submit"
                                className="w-full"
                                disabled={campaignForm.formState.isSubmitting}
                              >
                                {campaignForm.formState.isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Creating...
                                  </>
                                ) : (
                                  "Create Campaign"
                                )}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Dialog
                      open={campaignModalOpen}
                      onOpenChange={setCampaignModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-20"
                          disabled={!selectedBrandKitId}
                        >
                          <Plus className="mr-2 h-5 w-5" /> Create Campaign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Campaign</DialogTitle>
                          <DialogDescription>
                            Define campaign goals and messaging
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...campaignForm}>
                          <form
                            onSubmit={campaignForm.handleSubmit(
                              handleCreateCampaign
                            )}
                            className="space-y-4"
                          >
                            {renderCampaignFormFields("-2")}
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={campaignForm.formState.isSubmitting}
                            >
                              {campaignForm.formState.isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                  Creating...
                                </>
                              ) : (
                                "Create Campaign"
                              )}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                  {!selectedBrandKitId && (
                    <p className="text-xs text-muted-foreground text-center">
                      Select a brand kit first
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Step 3: Generate */}
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
            {/* Regeneration Limit Control */}
            <div className="space-y-2">
              <Label htmlFor="regen-limit">
                Regeneration Limit (Critique Loop)
              </Label>
              <div className="flex items-center gap-4">
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
                  Max iterations for AI critique feedback loop (default: 5)
                </p>
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
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating
                    & Critiquing...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Generate & Critique</div>
                      <div className="text-xs font-normal opacity-90">
                        Full AI feedback loop
                      </div>
                    </div>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {latestScorecard && (
          <>
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
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />{" "}
                        Iterating...
                      </>
                    ) : (
                      "Continue Iterating"
                    )}
                  </Button>
                </div>

                <video
                  src={
                    latestScorecard.videoUrl.startsWith("http")
                      ? latestScorecard.videoUrl
                      : `http://localhost:3000${latestScorecard.videoUrl}`
                  }
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-md border"
                >
                  Your browser does not support the video tag.
                </video>

                <div className="grid gap-3 md:grid-cols-2">
                  {latestScorecard.scorecard.scores.map((score) => (
                    <div
                      key={score.dimension}
                      className="rounded-md border p-3 flex flex-col justify-between min-h-[120px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">
                            {score.dimension}
                          </span>
                          <Badge
                            variant={
                              score.status === "pass"
                                ? "outline"
                                : "destructive"
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

            {scorecards && scorecards.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    History ({scorecards.length} iterations)
                  </CardTitle>
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
                                  {formatDistanceToNow(
                                    new Date(record.createdAt),
                                    { addSuffix: true }
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openContinueIterationModal(record)
                                  }
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

                            <video
                              src={
                                record.videoUrl.startsWith("http")
                                  ? record.videoUrl
                                  : `http://localhost:3000${record.videoUrl}`
                              }
                              controls
                              className="w-full rounded-md border mb-3"
                              style={{ maxHeight: "300px" }}
                            >
                              Your browser does not support the video tag.
                            </video>

                            <div className="grid gap-2 md:grid-cols-2">
                              {record.scorecard.scores.map((score) => (
                                <div
                                  key={`${record.id}-${score.dimension}`}
                                  className="rounded-md border px-3 py-2 flex flex-col justify-between min-h-[100px]"
                                >
                                  <div>
                                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                                      <span>{score.dimension}</span>
                                      <span>
                                        {(score.score * 100).toFixed(0)}%
                                      </span>
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
                  </Carousel>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Edit Brand Kit Modal */}
        <Dialog
          open={editBrandKitModalOpen}
          onOpenChange={setEditBrandKitModalOpen}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Brand Kit</DialogTitle>
              <DialogDescription>
                Update your brand&apos;s personality and visual identity
              </DialogDescription>
            </DialogHeader>
            <Form {...brandKitForm}>
              <form
                onSubmit={brandKitForm.handleSubmit(handleUpdateBrandKit)}
                className="space-y-4"
              >
                {renderBrandKitFormFields("-edit")}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={brandKitForm.formState.isSubmitting}
                >
                  {brandKitForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Updating...
                    </>
                  ) : (
                    "Update Brand Kit"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Campaign Modal */}
        <Dialog
          open={editCampaignModalOpen}
          onOpenChange={setEditCampaignModalOpen}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>
                Update campaign goals and messaging
              </DialogDescription>
            </DialogHeader>
            <Form {...campaignForm}>
              <form
                onSubmit={campaignForm.handleSubmit(handleUpdateCampaign)}
                className="space-y-4"
              >
                {renderCampaignFormFields("-edit")}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={campaignForm.formState.isSubmitting}
                >
                  {campaignForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Updating...
                    </>
                  ) : (
                    "Update Campaign"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Continue Iteration Modal */}
        <Dialog
          open={continueIterationModalOpen}
          onOpenChange={setContinueIterationModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Continue Iterating from Iteration{" "}
                {selectedScorecardForContinue?.iteration}
              </DialogTitle>
              <DialogDescription>
                Create additional iterations building on this result's prompt
                and critique feedback.
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
                  value={continueIterationCount}
                  onChange={(e) =>
                    setContinueIterationCount(
                      Number.parseInt(e.target.value, 10) || 3
                    )
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
                  value={continuePromptNotes}
                  onChange={(e) => setContinuePromptNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the original caption. Add notes to refine
                  the direction.
                </p>
              </div>

              {selectedScorecardForContinue && (
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <p className="text-sm font-semibold">
                    This will continue from:
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>
                      • Iteration {selectedScorecardForContinue.iteration}{" "}
                      critique feedback
                    </li>
                    <li>
                      • Overall status:{" "}
                      <span className="font-medium">
                        {selectedScorecardForContinue.overallStatus}
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
                  setContinueIterationModalOpen(false);
                  setSelectedScorecardForContinue(null);
                  setContinuePromptNotes("");
                }}
                disabled={isContinuingIteration}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleContinueFromScorecard}
                disabled={isContinuingIteration}
              >
                {isContinuingIteration ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Iterating...
                  </>
                ) : (
                  `Start ${continueIterationCount} Iteration${
                    continueIterationCount > 1 ? "s" : ""
                  }`
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
