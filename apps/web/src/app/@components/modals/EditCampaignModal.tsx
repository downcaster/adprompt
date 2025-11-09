/**
 * @file Edit campaign modal component
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { CampaignFormFields, campaignSchema } from "../forms/CampaignFormFields";

interface EditCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<z.infer<typeof campaignSchema>>;
  handleUpdate: (values: z.infer<typeof campaignSchema>) => Promise<void>;
  productFile: File | null;
  setProductFile: (file: File | null) => void;
}

export function EditCampaignModal({
  open,
  onOpenChange,
  form,
  handleUpdate,
  productFile,
  setProductFile,
}: EditCampaignModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update campaign goals and messaging
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <CampaignFormFields
              form={form}
              idSuffix="-edit"
              productFile={productFile}
              setProductFile={setProductFile}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Campaign"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

