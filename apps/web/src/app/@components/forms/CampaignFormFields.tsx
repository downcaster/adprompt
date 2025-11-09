/**
 * @file Campaign form fields component
 */

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const campaignSchema = z.object({
  productDescription: z
    .string()
    .min(1, { message: "Product description is required" }),
  audience: z.string().min(1, { message: "Audience is required" }),
  callToAction: z.string().min(1, { message: "Call to action is required" }),
  toneKeywords: z.string().min(1, { message: "At least one tone keyword is required" }),
});

interface CampaignFormFieldsProps {
  form: UseFormReturn<z.infer<typeof campaignSchema>>;
  idSuffix?: string;
  productFile: File | null;
  setProductFile: (file: File | null) => void;
}

export function CampaignFormFields({
  form,
  idSuffix = "",
  productFile,
  setProductFile,
}: CampaignFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
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
        control={form.control}
        name="audience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Audience</FormLabel>
            <FormControl>
              <Input placeholder="Athletes aged 20-35" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="callToAction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call to Action</FormLabel>
            <FormControl>
              <Input placeholder="Shop Now" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
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
          onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
        />
        {productFile && (
          <p className="text-xs text-muted-foreground mt-1">
            Selected: {productFile.name}
          </p>
        )}
      </div>
    </>
  );
}

