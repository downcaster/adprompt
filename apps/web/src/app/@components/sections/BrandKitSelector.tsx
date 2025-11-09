/**
 * @file Brand Kit selector tile component
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
import { Palette, Plus, CheckCircle2, Pencil, Loader2 } from "lucide-react";
import { BrandKit } from "@/types/api";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { BrandKitFormFields, brandKitSchema } from "../forms/BrandKitFormFields";

interface BrandKitSelectorProps {
  brandKits: BrandKit[] | undefined;
  selectedBrandKit: BrandKit | undefined;
  selectedBrandKitId: string | null;
  setSelectedBrandKitId: (id: string | null) => void;
  brandKitModalOpen: boolean;
  setBrandKitModalOpen: (open: boolean) => void;
  brandKitForm: UseFormReturn<z.infer<typeof brandKitSchema>>;
  handleCreateBrandKit: (values: z.infer<typeof brandKitSchema>) => Promise<void>;
  openEditBrandKitModal: (kit: BrandKit, e: React.MouseEvent) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  paletteFile: File | null;
  setPaletteFile: (file: File | null) => void;
}

export function BrandKitSelector({
  brandKits,
  selectedBrandKit,
  selectedBrandKitId,
  setSelectedBrandKitId,
  brandKitModalOpen,
  setBrandKitModalOpen,
  brandKitForm,
  handleCreateBrandKit,
  openEditBrandKitModal,
  logoFile,
  setLogoFile,
  paletteFile,
  setPaletteFile,
}: BrandKitSelectorProps) {
  return (
    <>
      {selectedBrandKit ? (
        <Card className="flex flex-col">
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
              <p className="font-semibold text-base">{selectedBrandKit.name}</p>
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
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
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
                <Dialog open={brandKitModalOpen} onOpenChange={setBrandKitModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-10">
                      <Plus className="mr-2 h-4 w-4" /> Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Brand Kit</DialogTitle>
                      <DialogDescription>
                        Define your brand&apos;s personality and visual identity
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...brandKitForm}>
                      <form
                        onSubmit={brandKitForm.handleSubmit(handleCreateBrandKit)}
                        className="space-y-4"
                      >
                        <BrandKitFormFields
                          form={brandKitForm}
                          logoFile={logoFile}
                          setLogoFile={setLogoFile}
                          paletteFile={paletteFile}
                          setPaletteFile={setPaletteFile}
                        />
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
              <Dialog open={brandKitModalOpen} onOpenChange={setBrandKitModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-20">
                    <Plus className="mr-2 h-5 w-5" /> Create Brand Kit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Brand Kit</DialogTitle>
                    <DialogDescription>
                      Define your brand&apos;s personality and visual identity
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...brandKitForm}>
                    <form
                      onSubmit={brandKitForm.handleSubmit(handleCreateBrandKit)}
                      className="space-y-4"
                    >
                      <BrandKitFormFields
                        form={brandKitForm}
                        idSuffix="-2"
                        logoFile={logoFile}
                        setLogoFile={setLogoFile}
                        paletteFile={paletteFile}
                        setPaletteFile={setPaletteFile}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={brandKitForm.formState.isSubmitting}
                      >
                        {brandKitForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
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
    </>
  );
}

