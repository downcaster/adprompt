# Dashboard Components Structure

This directory contains modular components extracted from the main `page.tsx` file.

## Directory Structure

```
@components/
├── forms/
│   ├── BrandKitFormFields.tsx    # Brand kit form fields with validation
│   └── CampaignFormFields.tsx    # Campaign form fields with validation
├── sections/
│   ├── CaptionSection.tsx        # Caption input textarea card
│   ├── BrandKitSelector.tsx      # Brand kit tile selector with modal
│   ├── CampaignSelector.tsx      # Campaign tile selector with modal (TODO)
│   ├── GenerationControls.tsx    # Generation buttons and settings (TODO)
│   └── ResultsDisplay.tsx        # Latest result and history carousel (TODO)
└── modals/
    ├── EditBrandKitModal.tsx     # Edit brand kit modal (TODO)
    ├── EditCampaignModal.tsx     # Edit campaign modal (TODO)
    └── ContinueIterationModal.tsx # Continue iteration modal (TODO)
```

## Component Responsibilities

### Forms
- **BrandKitFormFields**: Reusable form fields for creating/editing brand kits
- **CampaignFormFields**: Reusable form fields for creating/editing campaigns

### Sections
- **CaptionSection**: Caption input with descriptive card
- **BrandKitSelector**: Tile-based brand kit selection with create/edit functionality
- **CampaignSelector**: Tile-based campaign selection with create/edit functionality
- **GenerationControls**: Video generation buttons, regen limit control
- **ResultsDisplay**: Latest scorecard and history carousel

### Modals
- **EditBrandKitModal**: Modal for editing existing brand kits
- **EditCampaignModal**: Modal for editing existing campaigns
- **ContinueIterationModal**: Modal for continuing iterations from a specific scorecard

## Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Form fields can be used in create and edit contexts
3. **Testability**: Smaller components are easier to test
4. **Readability**: Main page.tsx is now under 200 lines
5. **Type Safety**: All components are fully typed with TypeScript

## Next Steps

Complete the TODO components to fully modularize the dashboard.

