# Styling Guide for humans.inc

> **Design Philosophy**: Sophisticated, writer-focused aesthetic for the modern creator (age 22-37). Clean, readable, and elegant with subtle sophistication.

## Color System

### Semantic Colors
- **Primary**: `oklch(35% 0.15 270)` (light) / `oklch(75% 0.15 270)` (dark) - Deep purple for accent elements
- **Background**: `oklch(99% 0.005 85)` (light) / `oklch(8% 0.01 20)` (dark) - Warm whites/deep blacks
- **Foreground**: `oklch(15% 0.01 20)` (light) / `oklch(92% 0.01 85)` (dark) - Rich text colors
- **Muted**: `oklch(96% 0.01 85)` (light) / `oklch(12% 0.01 20)` (dark) - Subtle backgrounds
- **Accent**: `oklch(25% 0.02 25)` (light) / `oklch(88% 0.01 85)` (dark) - Secondary text
- **Secondary**: `oklch(85% 0.02 80)` (light) / `oklch(20% 0.02 25)` (dark) - Supporting elements

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

## Best Practices

### Performance
- Use CSS variables for theming
- Minimize layout shifts
- Optimize font loading with font-display: swap

### Maintainability
- Use semantic color names
- Follow consistent naming conventions
- Document component variations
- Use Tailwind's arbitrary value syntax sparingly

### User Experience
- Prioritize readability over decorative elements
- Maintain consistent interaction patterns
- Design for both new and returning users
- Test on various screen sizes and devices

---

This guide should be referenced for all new components and design decisions to maintain consistency across the platform.
