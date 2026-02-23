# Specification

## Summary
**Goal:** Restore PDF Vaulty to Version 29, the last stable deployment before PowerPoint conversion feature caused failures.

**Planned changes:**
- Remove PowerPoint to PDF conversion feature (component, utility function, and routes)
- Remove PowerPoint option from the Convert Into PDF tools page
- Restore application to Version 29 state with all other PDF tools intact (merge, split, compress, rotate, protect, Word/Excel/Image to PDF)
- Ensure successful deployment to Internet Computer with proper canister resolution

**User-visible outcome:** Users can access a stable, working PDF Vaulty application at pdfvaulty-url.caffeine.xyz with all core PDF tools (except PowerPoint conversion) functioning properly without deployment errors.
