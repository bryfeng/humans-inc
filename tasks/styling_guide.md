# Styling Guide for humans.inc

> **Design Philosophy**: Sophisticated, writer-focused aesthetic for the modern creator (age 22-37). Clean, readable, and elegant with subtle sophistication.

## Color System

### Semantic Colors (Current Implementation)

- **Background**: `oklch(97.5% 0.006 45)` (light) / `oklch(8% 0.008 45)` (dark) - Warm, inviting backgrounds
- **Foreground**: `oklch(28% 0.008 40)` (light) / `oklch(92% 0.004 60)` (dark) - Rich, readable text
- **Muted**: `oklch(93% 0.01 50)` (light) / `oklch(15% 0.012 50)` (dark) - Subtle backgrounds and containers
- **Accent**: `oklch(50% 0.015 45)` (light) / `oklch(75% 0.008 55)` (dark) - Secondary text and highlights
- **Primary**: `oklch(60% 0.06 180)` (light) / `oklch(70% 0.07 180)` (dark) - Call-to-action and interactive elements
- **Secondary**: `oklch(88% 0.012 50)` (light) / `oklch(22% 0.015 45)` (dark) - Supporting UI elements

### Background System

The application uses clean, semantic background colors without additional patterns:

- **Light Mode**: `oklch(97.5% 0.006 45)` - Warm, inviting background
- **Dark Mode**: `oklch(8% 0.008 45)` - Elegant dark background
- **Design Philosophy**: Clean, distraction-free backgrounds that let content shine
- **Future Considerations**: Background patterns can be added later for enhanced sophistication

### Color Usage Guidelines

- Use `primary` for CTAs, links, and key interactive elements
- Use `accent` for secondary text and subtle highlights
- Use `muted` for card backgrounds, sections, and subtle containers
- Keep contrast ratios above 4.5:1 for accessibility

## Typography

### Font Stack

- **Primary**: Geist Sans (variable) - Modern, clean, excellent readability
- **Mono**: Geist Mono (variable) - For code blocks and technical content

### Font Scale & Spacing

All font sizes include optimized line-height and letter-spacing for readability:

```css
text-xs: 0.75rem (line-height: 1.5, letter-spacing: -0.005em)
text-sm: 0.875rem (line-height: 1.5, letter-spacing: -0.006em)
text-base: 1rem (line-height: 1.6, letter-spacing: -0.011em)
text-lg: 1.125rem (line-height: 1.6, letter-spacing: -0.014em)
text-xl: 1.25rem (line-height: 1.5, letter-spacing: -0.017em)
text-2xl: 1.5rem (line-height: 1.4, letter-spacing: -0.019em)
text-3xl: 1.875rem (line-height: 1.3, letter-spacing: -0.021em)
text-4xl: 2.25rem (line-height: 1.2, letter-spacing: -0.022em)
text-5xl: 3rem (line-height: 1.1, letter-spacing: -0.024em)
```

### Typography Guidelines

- Use `text-balance` for headlines to prevent awkward line breaks
- Use `text-pretty` for body text to improve readability
- Maintain 1.6 line-height for body text (optimal for reading)
- Use negative letter-spacing for tighter, more sophisticated feel

## Spacing & Layout

### Container Patterns

- **Page Container**: `container mx-auto px-6` - Responsive with consistent padding
- **Section Spacing**: `py-16` to `py-24` - Generous vertical rhythm
- **Card Padding**: `p-6` to `p-8` - Comfortable internal spacing

### Grid & Flex Patterns

- **Feature Grid**: `grid md:grid-cols-3 gap-8` - Responsive three-column layout
- **Navigation**: `flex items-center space-x-4` to `space-x-6` - Clean horizontal spacing
- **Vertical Stacks**: `space-y-6` to `space-y-8` - Consistent vertical rhythm

## Component Patterns

### Buttons

#### Primary CTA

```css
bg-primary text-background px-8 py-4 rounded-xl font-semibold
hover:bg-primary/90 transition-all duration-200 shadow-lg
hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
```

#### Secondary Button

```css
text-foreground/80 hover:text-foreground px-4 py-2 rounded-lg
hover:bg-muted/40 transition-all duration-200
```

#### Subtle Action

```css
text-foreground/60 hover:text-foreground/80 px-3 py-1.5
rounded-lg hover:bg-muted/30 transition-colors duration-200
```

### Cards & Containers

#### Feature Card

```css
p-8 rounded-2xl bg-background/60 border border-foreground/5
hover:border-foreground/10 transition-colors duration-200
```

#### Glass Effect (Optional)

```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### User Elements

#### Avatar Circle

```css
w-8 h-8 rounded-full bg-primary/10 border border-primary/20
flex items-center justify-center
```

#### User Initial

```css
text-xs font-medium text-primary uppercase
```

## Interactive States

### Hover Effects

- **Scale**: `hover:scale-[1.02]` for buttons
- **Opacity**: `hover:opacity-90` for simple elements
- **Background**: `hover:bg-muted/40` for subtle hover states
- **Shadow**: `hover:shadow-xl` for elevated elements

### Active States

- **Scale Down**: `active:scale-[0.98]` for tactile feedback
- **Focus**: Custom focus-visible with primary color outline

### Transitions

- **Standard**: `transition-colors duration-200`
- **Enhanced**: `transition-all duration-200`
- **Quick**: `transition-opacity duration-150`

## Header Design

### Navigation Structure

- **Logo**: Bold, tracking-tight, hover color change to primary
- **User Avatar**: Circular with initial, primary color scheme
- **Actions**: Subtle hover states with rounded backgrounds
- **Mobile**: Simplified layout with essential elements only

### Authentication States

- **Logged Out**: "Sign In" + prominent "Get Started" CTA
- **Logged In**: Avatar + name + "Dashboard" + "Sign Out"

## Content Layout

### Hero Sections

- **Large Headlines**: 5xl to 7xl font sizes with tight line-height
- **Subtitles**: xl to 2xl with accent colors
- **CTA Placement**: Centered with clear visual hierarchy
- **Background**: Subtle gradients with blur effects

### Feature Sections

- **Three-Column Grid**: Responsive on desktop, stacked on mobile
- **Icon Integration**: Emoji or simple icons in colored containers
- **Consistent Spacing**: 8-unit spacing throughout

## Accessibility

### Focus Management

- Custom focus-visible styles with primary color
- 2px outline with 2px offset
- Rounded corners for consistency

### Color Contrast

- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Test in both light and dark modes

### Typography Accessibility

- Optimized letter-spacing for dyslexia-friendly reading
- Sufficient line-height (1.6) for easy scanning
- text-wrap utilities for better readability

## Animation Guidelines

### Micro-Interactions

- **Fade In**: `animate-fade-in` for page loads
- **Scale**: Subtle hover scaling (1.02x)
- **Smooth Transitions**: 200ms duration for most interactions

### Page Transitions

- Smooth scroll behavior enabled globally
- Respect user's motion preferences
- Keep animations subtle and purposeful

## Dark Mode Considerations

- Maintain color relationships across themes
- Test all components in both modes
- Use semantic color variables consistently
- Ensure sufficient contrast in both themes

## Custom Utilities (Current Implementation)

### Text Utilities

- **text-balance**: `text-wrap: balance` - Prevents orphaned words in headlines
- **text-pretty**: `text-wrap: pretty` - Improves readability in body text

### Glass Effects

- **glass**: Subtle glassmorphism for light backgrounds
  ```css
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```
- **glass-dark**: Enhanced glassmorphism for dark backgrounds
  ```css
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  ```

### Button Components

- **btn-primary**: Complete primary button styling with focus states
- **btn-secondary**: Secondary button with subtle backgrounds

### Form Components

- **input-primary**: Enhanced form inputs with proper focus rings

### Animation Utilities

- **animate-fade-in**: 0.3s fade-in animation
- **animate-slide-up**: 0.3s slide-up with fade
- **animate-scale-in**: 0.2s scale-in animation
- **animate-in**: 0.2s smooth entrance animation
- **animate-out**: 0.15s smooth exit animation
- **skeleton**: Loading skeleton with pulse animation

## Grid Background Integration

### Design Considerations

- Grid enhances visual hierarchy without distraction
- Complements the warm, sophisticated OKLCH color palette
- Maintains accessibility standards for all content
- Scales appropriately across different screen sizes
- Subtle enough for long-form reading and content creation

### Performance Notes

- Uses CSS gradients (no images) for optimal performance
- Leverages semantic color variables for automatic theme adaptation
- Minimal impact on rendering performance
- Grid adapts seamlessly to color system changes

## Best Practices

### Performance

- Leverage CSS custom properties for consistent theming
- Use semantic OKLCH color variables throughout the design system
- Optimize font loading with proper font-display settings
- Grid background uses efficient CSS gradients

### Maintainability

- All colors use semantic OKLCH variables for future adjustments
- Custom utilities follow consistent naming patterns
- Components inherit theme variables automatically
- Grid system adapts to color changes without modification

### User Experience

- Grid background provides subtle visual interest without distraction
- Color system maintains excellent contrast ratios in both themes
- Typography optimized for reading with proper letter-spacing and line-height
- Smooth transitions and micro-interactions enhance user feedback

### Accessibility

- Color contrast ratios exceed WCAG AA standards
- Grid background doesn't interfere with text readability
- Focus states are clearly visible and consistent
- Dark mode provides comfortable reading experience

---

This guide reflects the current sophisticated implementation and should be referenced for all new components and design decisions to maintain consistency across the platform.
