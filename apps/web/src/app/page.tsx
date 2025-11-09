/**
 * @file Main dashboard page - refactored with modular components
 */

"use client";

import { useState } from "react";
import useSWR from "swr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { BrandKit, CampaignBrief, ScorecardRecord } from "@/types/api";
import {
  createBrandKit,
  createCampaign,
  generateAndCritique,
  listBrandKits,
  listCampaigns,
  listScorecardsByCampaign,
  updateBrandKit,
  updateCampaign,
} from "@/lib/api";

// Component imports
import { CaptionSection } from "./@components/sections/CaptionSection";
import { BrandKitSelector } from "./@components/sections/BrandKitSelector";
import { CampaignSelector } from "./@components/sections/CampaignSelector";
import { GenerationControls } from "./@components/sections/GenerationControls";
import { ResultsDisplay } from "./@components/sections/ResultsDisplay";
import { EditBrandKitModal } from "./@components/modals/EditBrandKitModal";
import { EditCampaignModal } from "./@components/modals/EditCampaignModal";
import { ContinueIterationModal } from "./@components/modals/ContinueIterationModal";
import { brandKitSchema } from "./@components/forms/BrandKitFormFields";
import { campaignSchema } from "./@components/forms/CampaignFormFields";
import { ModeToggle } from "@/components/mode-toggle";

export default function DashboardPage() {
  // State
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [regenLimit, setRegenLimit] = useState(5);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal states
  const [brandKitModalOpen, setBrandKitModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editBrandKitModalOpen, setEditBrandKitModalOpen] = useState(false);
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [continueIterationModalOpen, setContinueIterationModalOpen] = useState(false);
  
  // Edit states
  const [editingBrandKit, setEditingBrandKit] = useState<BrandKit | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignBrief | null>(null);
  const [selectedScorecardForContinue, setSelectedScorecardForContinue] = useState<ScorecardRecord | null>(null);
  const [continueIterationCount, setContinueIterationCount] = useState(3);
  const [continuePromptNotes, setContinuePromptNotes] = useState("");
  const [isContinuingIteration, setIsContinuingIteration] = useState(false);

  // File uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [paletteFile, setPaletteFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);

  // Data fetching
  const { data: brandKits, mutate: mutateBrandKits } = useSWR<BrandKit[]>("brandKits", listBrandKits);
  const { data: campaigns, mutate: mutateCampaigns } = useSWR<CampaignBrief[]>(
    selectedBrandKitId ? `campaigns-${selectedBrandKitId}` : null,
    () => selectedBrandKitId ? listCampaigns(selectedBrandKitId) : Promise.resolve([])
  );
  const { data: scorecards, mutate: mutateScorecards} = useSWR<ScorecardRecord[]>(
    selectedCampaignId ? `scorecards-${selectedCampaignId}` : null,
    () => selectedCampaignId ? listScorecardsByCampaign(selectedCampaignId) : Promise.resolve([])
  );

  // Forms
  const brandKitForm = useForm<z.infer<typeof brandKitSchema>>({
    resolver: zodResolver(brandKitSchema),
    defaultValues: { name: "", toneDescription: "" },
  });

  const campaignForm = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { productDescription: "", audience: "", callToAction: "", toneKeywords: "" },
  });

  // Selected items
  const selectedBrandKit = brandKits?.find((kit) => kit.id === selectedBrandKitId);
  const selectedCampaign = campaigns?.find((c) => c.id === selectedCampaignId);

  // Handlers
  const handleCreateBrandKit = async (values: z.infer<typeof brandKitSchema>) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("toneDescription", values.toneDescription);
      if (values.targetAudience) formData.append("targetAudience", values.targetAudience);
      if (values.primaryCallToAction) formData.append("primaryCallToAction", values.primaryCallToAction);
      if (values.prohibitedPhrases) formData.append("prohibitedPhrases", values.prohibitedPhrases);
      if (values.manualHexColors) formData.append("manualHexColors", values.manualHexColors);
      if (logoFile) formData.append("logo", logoFile);
      if (paletteFile) formData.append("palette", paletteFile);

      const newBrandKit = await createBrandKit(formData);
      toast.success("Brand kit created!");
      setBrandKitModalOpen(false);
      brandKitForm.reset();
      setLogoFile(null);
      setPaletteFile(null);
      await mutateBrandKits();
      setSelectedBrandKitId(newBrandKit.id);
    } catch (error) {
      toast.error((error as Error).message || "Failed to create brand kit");
    }
  };

  const handleCreateCampaign = async (values: z.infer<typeof campaignSchema>) => {
    if (!selectedBrandKitId) {
      toast.error("Please select a brand kit first");
      return;
    }

    if (!productFile) {
      toast.error("Product image is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("brandKitId", selectedBrandKitId);
      formData.append("productDescription", values.productDescription);
      formData.append("audience", values.audience);
      formData.append("callToAction", values.callToAction);
      formData.append("toneKeywords", values.toneKeywords);
      formData.append("product", productFile);

      const newCampaign = await createCampaign(formData);
      toast.success("Campaign created!");
      setCampaignModalOpen(false);
      campaignForm.reset();
      setProductFile(null);
      await mutateCampaigns();
      setSelectedCampaignId(newCampaign.id);
    } catch (error) {
      toast.error((error as Error).message || "Failed to create campaign");
    }
  };

  const handleGenerate = async (withCritique: boolean) => {
    if (!selectedBrandKitId || !selectedCampaignId) return;

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
        toast.info("Draft generation (WIP)");
      }
    } catch (error) {
      toast.error((error as Error).message || "Generation failed");
    } finally {
      setIsDrafting(false);
      setIsGenerating(false);
    }
  };

  const canGenerate = !!(selectedBrandKitId && selectedCampaignId && !isDrafting && !isGenerating);

  const handleContinueFromScorecard = async () => {
    if (!selectedScorecardForContinue || !selectedBrandKitId || !selectedCampaignId) return;

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
    e.stopPropagation();
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

  const openEditCampaignModal = (campaign: CampaignBrief, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    campaignForm.reset({
      productDescription: campaign.productDescription,
      audience: campaign.audience,
      callToAction: campaign.callToAction,
      toneKeywords: campaign.toneKeywords.join(", "),
    });
    setEditCampaignModalOpen(true);
  };

  const handleUpdateBrandKit = async (values: z.infer<typeof brandKitSchema>) => {
    if (!editingBrandKit) return;

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("toneDescription", values.toneDescription);
      if (values.targetAudience) formData.append("targetAudience", values.targetAudience);
      if (values.primaryCallToAction) formData.append("primaryCallToAction", values.primaryCallToAction);
      if (values.prohibitedPhrases) formData.append("prohibitedPhrases", values.prohibitedPhrases);
      if (values.manualHexColors) formData.append("manualHexColors", values.manualHexColors);
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

  const handleUpdateCampaign = async (values: z.infer<typeof campaignSchema>) => {
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

  return (
    <div className="min-h-screen bg-background">
      <div>
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ADPrompt</p>
              <h1 className="text-xl font-semibold">AI Ad Generator</h1>
            </div>
            <ModeToggle />
          </div>
        </header>

        <main className="container mx-auto space-y-6 p-6">
          <CaptionSection caption={caption} setCaption={setCaption} />

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Connect your brand & campaign</h2>
              <p className="text-sm text-muted-foreground">
                Both are required to generate videos
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <BrandKitSelector
                brandKits={brandKits}
                selectedBrandKit={selectedBrandKit}
                selectedBrandKitId={selectedBrandKitId}
                setSelectedBrandKitId={setSelectedBrandKitId}
                brandKitModalOpen={brandKitModalOpen}
                setBrandKitModalOpen={setBrandKitModalOpen}
                brandKitForm={brandKitForm}
                handleCreateBrandKit={handleCreateBrandKit}
                openEditBrandKitModal={openEditBrandKitModal}
                logoFile={logoFile}
                setLogoFile={setLogoFile}
                paletteFile={paletteFile}
                setPaletteFile={setPaletteFile}
              />

              <CampaignSelector
                campaigns={campaigns}
                selectedCampaign={selectedCampaign}
                selectedCampaignId={selectedCampaignId}
                setSelectedCampaignId={setSelectedCampaignId}
                selectedBrandKitId={selectedBrandKitId}
                campaignModalOpen={campaignModalOpen}
                setCampaignModalOpen={setCampaignModalOpen}
                campaignForm={campaignForm}
                handleCreateCampaign={handleCreateCampaign}
                openEditCampaignModal={openEditCampaignModal}
                productFile={productFile}
                setProductFile={setProductFile}
              />
            </div>
          </div>

          <GenerationControls
            canGenerate={canGenerate}
            regenLimit={regenLimit}
            setRegenLimit={setRegenLimit}
            isDrafting={isDrafting}
            isGenerating={isGenerating}
            handleGenerate={handleGenerate}
          />

          <ResultsDisplay
            scorecards={scorecards}
            openContinueIterationModal={openContinueIterationModal}
            isContinuingIteration={isContinuingIteration}
          />
        </main>
      </div>

      {/* Modals */}
      <EditBrandKitModal
        open={editBrandKitModalOpen}
        onOpenChange={setEditBrandKitModalOpen}
        form={brandKitForm}
        handleUpdate={handleUpdateBrandKit}
        logoFile={logoFile}
        setLogoFile={setLogoFile}
        paletteFile={paletteFile}
        setPaletteFile={setPaletteFile}
      />

      <EditCampaignModal
        open={editCampaignModalOpen}
        onOpenChange={setEditCampaignModalOpen}
        form={campaignForm}
        handleUpdate={handleUpdateCampaign}
        productFile={productFile}
        setProductFile={setProductFile}
      />

      <ContinueIterationModal
        open={continueIterationModalOpen}
        onOpenChange={setContinueIterationModalOpen}
        selectedScorecard={selectedScorecardForContinue}
        iterationCount={continueIterationCount}
        setIterationCount={setContinueIterationCount}
        promptNotes={continuePromptNotes}
        setPromptNotes={setContinuePromptNotes}
        handleContinue={handleContinueFromScorecard}
        isIterating={isContinuingIteration}
      />
    </div>
  );
}

