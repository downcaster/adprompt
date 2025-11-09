/**
 * @file Edit brand kit modal component
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
import { BrandKitFormFields, brandKitSchema } from "../forms/BrandKitFormFields";

interface EditBrandKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<z.infer<typeof brandKitSchema>>;
  handleUpdate: (values: z.infer<typeof brandKitSchema>) => Promise<void>;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  paletteFile: File | null;
  setPaletteFile: (file: File | null) => void;
}

export function EditBrandKitModal({
  open,
  onOpenChange,
  form,
  handleUpdate,
  logoFile,
  setLogoFile,
  paletteFile,
  setPaletteFile,
}: EditBrandKitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Brand Kit</DialogTitle>
          <DialogDescription>
            Update your brand&apos;s personality and visual identity
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <BrandKitFormFields
              form={form}
              idSuffix="-edit"
              logoFile={logoFile}
              setLogoFile={setLogoFile}
              paletteFile={paletteFile}
              setPaletteFile={setPaletteFile}
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
                "Update Brand Kit"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

