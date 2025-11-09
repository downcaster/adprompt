/**
 * @file Brand Kit form fields component
 */

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const brandKitSchema = z.object({
  name: z.string().min(1, { message: "Brand name is required" }),
  toneDescription: z
    .string()
    .min(1, { message: "Tone description is required" }),
  targetAudience: z.string().optional(),
  primaryCallToAction: z.string().optional(),
  prohibitedPhrases: z.string().optional(),
  manualHexColors: z.string().optional(),
});

interface BrandKitFormFieldsProps {
  form: UseFormReturn<z.infer<typeof brandKitSchema>>;
  idSuffix?: string;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  paletteFile: File | null;
  setPaletteFile: (file: File | null) => void;
}

export function BrandKitFormFields({
  form,
  idSuffix = "",
  logoFile,
  setLogoFile,
  paletteFile,
  setPaletteFile,
}: BrandKitFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Name</FormLabel>
            <FormControl>
              <Input placeholder="Acme Corporation" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="toneDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tone & Voice</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Friendly, professional, approachable"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="targetAudience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Audience (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Millennials aged 25-40" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="primaryCallToAction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary CTA (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Shop Now" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="prohibitedPhrases"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prohibited Phrases (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="cheap, discount, sale" {...field} />
            </FormControl>
            <FormDescription>Comma-separated list</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="manualHexColors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Colors (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="#FF5733, #3498DB, blue" {...field} />
            </FormControl>
            <FormDescription>
              Hex codes or color names, comma-separated
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <Label htmlFor={`logo-upload${idSuffix}`}>
          Logo Upload (Optional)
        </Label>
        <Input
          id={`logo-upload${idSuffix}`}
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
        />
        {logoFile && (
          <p className="text-xs text-muted-foreground mt-1">
            Selected: {logoFile.name}
          </p>
        )}
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
        {paletteFile && (
          <p className="text-xs text-muted-foreground mt-1">
            Selected: {paletteFile.name}
          </p>
        )}
      </div>
    </>
  );
}

