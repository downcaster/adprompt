/**
 * @file Campaign selector tile component
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Layers, Plus, CheckCircle2, Pencil, Loader2 } from "lucide-react";
import { CampaignBrief } from "@/types/api";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { CampaignFormFields, campaignSchema } from "../forms/CampaignFormFields";

interface CampaignSelectorProps {
  campaigns: CampaignBrief[] | undefined;
  selectedCampaign: CampaignBrief | undefined;
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
  selectedBrandKitId: string | null;
  campaignModalOpen: boolean;
  setCampaignModalOpen: (open: boolean) => void;
  campaignForm: UseFormReturn<z.infer<typeof campaignSchema>>;
  handleCreateCampaign: (values: z.infer<typeof campaignSchema>) => Promise<void>;
  openEditCampaignModal: (campaign: CampaignBrief, e: React.MouseEvent) => void;
  productFile: File | null;
  setProductFile: (file: File | null) => void;
}

export function CampaignSelector({
  campaigns,
  selectedCampaign,
  selectedCampaignId,
  setSelectedCampaignId,
  selectedBrandKitId,
  campaignModalOpen,
  setCampaignModalOpen,
  campaignForm,
  handleCreateCampaign,
  openEditCampaignModal,
  productFile,
  setProductFile,
}: CampaignSelectorProps) {
  return (
    <>
      {selectedCampaign ? (
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Campaign Brief</CardTitle>
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
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
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
                          onClick={(e) => openEditCampaignModal(campaign, e)}
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
                <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
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
                        onSubmit={campaignForm.handleSubmit(handleCreateCampaign)}
                        className="space-y-4"
                      >
                        <CampaignFormFields
                          form={campaignForm}
                          productFile={productFile}
                          setProductFile={setProductFile}
                        />
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
              <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-20"
                    disabled={!selectedBrandKitId}
                  >
                    <Plus className="mr-2 h-5 w-5" />{" "}
                    {!selectedBrandKitId
                      ? "Select Brand Kit First"
                      : "Create Campaign"}
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
                      onSubmit={campaignForm.handleSubmit(handleCreateCampaign)}
                      className="space-y-4"
                    >
                      <CampaignFormFields
                        form={campaignForm}
                        idSuffix="-2"
                        productFile={productFile}
                        setProductFile={setProductFile}
                      />
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
          </CardContent>
        </Card>
      )}
    </>
  );
}

