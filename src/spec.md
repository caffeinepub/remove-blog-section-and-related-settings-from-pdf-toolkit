# Specification

## Summary
**Goal:** Add PowerPoint to PDF conversion feature to PDF Vaulty.

**Planned changes:**
- Create PowerPointToPdfPage component with drag-and-drop upload for .ppt and .pptx files
- Implement powerPointToPdf.ts utility function for client-side PowerPoint to PDF conversion
- Add PowerPoint to PDF card to ConvertIntoPdfPage grid
- Register /tools/powerpoint-to-pdf route in App.tsx
- Add English and Spanish translations for PowerPoint to PDF feature
- Add PowerPoint to PDF link to homepage tool grid

**User-visible outcome:** Users can convert PowerPoint presentations to PDF format through a new dedicated page, accessible from the homepage and the "Convert into PDF" section.
