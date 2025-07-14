# Phase 4: Visitor View - Displaying User Pages

> **Note**: Follow [code_guidelines.md](./code_guidelines.md) for all implementation work.

This phase focuses on creating the public-facing components that visitors see when they view a user's profile page. We need to build visitor view components for each block type and update the main profile page to display content dynamically.

## Phase 4 Overview

**Current Status**: 🔄 **IN PROGRESS**

The creator editing experience is complete (Phase 3). Now we need to build the visitor experience - the public view of user profiles that showcases their blocks in a beautiful, readable format.

## Tickets

### 4.1 Bio Block - Visitor View

- **Description**: Create a component to display formatted bio content for public visitors.
- **Tasks**:
  - [ ] Create `BioBlockView` component in `/src/features/blocks/components/`.
  - [ ] Display profile picture, display name, tagline, and bio text.
  - [ ] Render personal links as clickable buttons/links.
  - [ ] Handle cases where content fields are missing or empty.
  - [ ] Style the component to be visually appealing and responsive.
- **Status**: To Do
- **Acceptance Criteria**:
  - Bio block displays all content fields in an attractive layout.
  - Profile picture is properly sized and displayed with fallback for missing images.
  - Personal links are rendered as accessible, clickable elements.
  - Component gracefully handles missing or incomplete bio data.
  - Layout is responsive and works well on mobile and desktop.

### 4.2 Text Block - Visitor View

- **Description**: Create a component to display text content with proper formatting support.
- **Tasks**:
  - [ ] Create `TextBlockView` component in `/src/features/blocks/components/`.
  - [ ] Support both plain text and markdown rendering.
  - [ ] Add appropriate typography styling for readability.
  - [ ] Handle optional block titles.
- **Status**: To Do
- **Acceptance Criteria**:
  - Text content is displayed with proper formatting (plain text or markdown).
  - Markdown content is properly parsed and styled.
  - Typography is optimized for readability.
  - Block titles are displayed when present.

### 4.3 Links Block - Visitor View

- **Description**: Create a component to display curated links in an organized, browsable format.
- **Tasks**:
  - [ ] Create `LinksBlockView` component in `/src/features/blocks/components/`.
  - [ ] Display links with titles, URLs, and descriptions.
  - [ ] Style links as cards or list items with proper visual hierarchy.
  - [ ] Make links clickable and accessible.
  - [ ] Handle optional descriptions and missing content.
- **Status**: To Do
- **Acceptance Criteria**:
  - Links are displayed in an organized, scannable format.
  - Each link shows title, URL, and description (if available).
  - Links are accessible and open properly (external links in new tabs).
  - Visual design makes it easy to browse multiple links.

### 4.4 Content List Block - Visitor View

- **Description**: Create a component to display curated content items with annotations.
- **Tasks**:
  - [ ] Create `ContentListBlockView` component in `/src/features/blocks/components/`.
  - [ ] Display content items with titles, types, and user annotations.
  - [ ] Show content type indicators (article, book, video, podcast, etc.).
  - [ ] Make URLs clickable while highlighting user's annotations.
  - [ ] Support different layout options based on content type.
- **Status**: To Do
- **Acceptance Criteria**:
  - Content items are displayed with clear type indicators.
  - User annotations are prominently featured to show personal insights.
  - URLs are accessible and properly linked.
  - Different content types can have appropriate visual treatments.

### 4.5 Block Renderer Component

- **Description**: Create a unified component that can render any block type in visitor view.
- **Tasks**:
  - [ ] Create `BlockRenderer` component in `/src/features/blocks/components/`.
  - [ ] Add logic to determine which visitor component to render based on `block_type`.
  - [ ] Handle block titles and optional configurations.
  - [ ] Add error boundaries for graceful handling of rendering issues.
  - [ ] Support future block types through extensible architecture.
- **Status**: To Do
- **Acceptance Criteria**:
  - Component can render all implemented block types correctly.
  - Block titles are displayed consistently when present.
  - Error handling prevents broken blocks from breaking the entire page.
  - Architecture allows easy addition of new block types.

### 4.6 Update Public Profile Page

- **Description**: Update the main user profile page (`app/[username]/page.tsx`) to fetch and display user blocks.
- **Tasks**:
  - [ ] Modify `app/[username]/page.tsx` to fetch user's blocks from Supabase.
  - [ ] Add server-side function to get public blocks (respecting any visibility settings).
  - [ ] Integrate `BlockRenderer` to display blocks in order.
  - [ ] Handle edge cases: no blocks, missing profile, etc.
  - [ ] Ensure proper SEO metadata based on user's bio block.
- **Status**: To Do
- **Acceptance Criteria**:
  - Profile pages load and display user blocks in the correct order.
  - Page handles users with no blocks gracefully.
  - 404 pages are shown for non-existent usernames.
  - SEO metadata is populated from user's bio information.
  - Page loads efficiently with proper caching.

### 4.7 Enhanced Profile Page Features

- **Description**: Add polish and enhanced features to the public profile experience.
- **Tasks**:
  - [ ] Add dynamic page titles based on user's display name.
  - [ ] Implement Open Graph metadata for social sharing.
  - [ ] Add loading states and error handling.
  - [ ] Create a clean, minimal layout focused on content.
  - [ ] Ensure excellent mobile responsiveness.
- **Status**: To Do
- **Acceptance Criteria**:
  - Page titles reflect the user's name and brand.
  - Social sharing shows proper preview images and descriptions.
  - Loading and error states provide good user experience.
  - Design is clean and puts focus on the user's content.
  - Mobile experience is optimized and touch-friendly.

## Implementation Notes

### Architecture Considerations

- **Component Structure**: All visitor view components should follow a consistent pattern and be located in `/src/features/blocks/components/`
- **Data Flow**: Public profile pages should use server-side rendering for better SEO and performance
- **Responsive Design**: All components must work well on mobile devices since profile sharing often happens on mobile
- **Performance**: Consider image optimization and lazy loading for media-heavy profiles

### Future Extensibility

- The `BlockRenderer` component should be designed to easily accommodate new block types
- Consider how block configurations (`config` JSONB field) might affect visitor view rendering
- Plan for potential visibility/privacy controls on blocks

## Dependencies

This phase depends on:
- ✅ Phase 3: Creator editing functionality must be complete
- ✅ Existing user authentication and profile infrastructure
- ✅ Block data model and database schema

## Next Steps

After Phase 4 completion, the core functionality for humans.inc V1 will be ready. Phase 5 will focus on refinements, performance optimizations, and polish.
