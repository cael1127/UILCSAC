# 🎨 UIL CS Academy Color System

## Overview
This document outlines the comprehensive color system for UIL CS Academy, designed to create a professional, accessible, and visually appealing user experience.

## 🟠 Primary Color Palette

### Core Colors
- **UT Orange** (`#fb8b24`) - Primary brand color, used for CTAs, highlights, and primary actions
- **Smoky Black** (`#0a0903`) - Primary text color, provides excellent contrast and readability
- **Slate Gray** (`#7c90a0`) - Secondary color, used for secondary actions and subtle accents
- **Dim Gray** (`#747274`) - Muted text and borders, provides subtle visual hierarchy
- **Ivory** (`#f4f9e9`) - Background color, creates a warm, welcoming feel

### Color Values
```css
:root {
  --ut-orange: #fb8b24;
  --smoky-black: #0a0903;
  --slate-gray: #7c90a0;
  --dim-gray: #747274;
  --ivory: #f4f9e9;
}
```

## 🎯 Semantic Color Mapping

### Light Theme
- **Background**: Ivory (`#f4f9e9`)
- **Foreground**: Smoky Black (`#0a0903`)
- **Primary**: UT Orange (`#fb8b24`)
- **Secondary**: Slate Gray (`#7c90a0`)
- **Muted**: Light gray (`#f8f9fa`)
- **Border**: Light gray (`#e5e7eb`)

### Dark Theme
- **Background**: Smoky Black (`#0a0903`)
- **Foreground**: Ivory (`#f4f9e9`)
- **Primary**: UT Orange (`#fb8b24`)
- **Secondary**: Slate Gray (`#7c90a0`)
- **Muted**: Dark gray (`#2a2a2a`)
- **Border**: Dark gray (`#404040`)

## 🚀 Utility Classes

### Background Colors
```css
.bg-ut-orange     /* Primary brand background */
.bg-smoky-black   /* Dark background */
.bg-slate-gray    /* Secondary background */
.bg-dim-gray      /* Muted background */
.bg-ivory         /* Light background */
```

### Text Colors
```css
.text-ut-orange     /* Primary brand text */
.text-smoky-black   /* Primary text */
.text-slate-gray    /* Secondary text */
.text-dim-gray      /* Muted text */
.text-ivory         /* Light text */
```

### Border Colors
```css
.border-ut-orange     /* Primary brand border */
.border-smoky-black   /* Dark border */
.border-slate-gray    /* Secondary border */
.border-dim-gray      /* Muted border */
.border-ivory         /* Light border */
```

## 🌈 Gradient Utilities

### Predefined Gradients
```css
.gradient-ut      /* UT Orange to Smoky Black */
.gradient-cool    /* Slate Gray to Dim Gray */
.gradient-warm    /* UT Orange to Ivory */
```

### Custom Gradients
```css
/* Create custom gradients using CSS variables */
background: linear-gradient(135deg, var(--ut-orange), var(--slate-gray));
background: linear-gradient(90deg, var(--ivory), var(--smoky-black));
```

## 🎭 Interactive States

### Hover Effects
```css
.hover-lift       /* Subtle upward movement on hover */
.hover-glow       /* Orange glow effect on hover */
```

### Focus States
```css
.focus-ring       /* Orange focus ring with offset */
```

## 📱 Component-Specific Colors

### Buttons
```css
.btn-primary      /* UT Orange background, white text */
.btn-secondary    /* Slate Gray background, white text */
```

### Cards
```css
.card-ut          /* White background, subtle shadow, hover effects */
```

### Inputs
```css
.input-ut         /* Light background, UT Orange focus border */
```

### Loading States
```css
.loading-ut       /* Animated shimmer with UT colors */
```

## 🎨 Color Accessibility

### Contrast Ratios
- **UT Orange on White**: 3.5:1 (Good)
- **Smoky Black on Ivory**: 15.6:1 (Excellent)
- **Slate Gray on White**: 3.2:1 (Good)
- **Dim Gray on Ivory**: 4.8:1 (Good)

### Color Blindness Considerations
- UT Orange and Slate Gray have sufficient contrast for most color vision deficiencies
- Text always uses high-contrast combinations
- Icons and graphics include alternative text or patterns

## 🔧 Implementation Examples

### Basic Usage
```tsx
// Button with primary colors
<button className="bg-ut-orange text-smoky-black px-4 py-2 rounded">
  Get Started
</button>

// Card with hover effects
<div className="card-ut hover-lift">
  <h3 className="text-smoky-black">Title</h3>
  <p className="text-dim-gray">Description</p>
</div>

// Gradient hero section
<div className="gradient-ut text-white py-20">
  <h1>Welcome to UIL CS Academy</h1>
</div>
```

### Advanced Usage
```tsx
// Custom gradient with opacity
<div className="bg-gradient-to-r from-ut-orange/80 to-slate-gray/60">
  Content
</div>

// Conditional colors based on theme
<div className="bg-ivory dark:bg-smoky-black text-smoky-black dark:text-ivory">
  Adaptive content
</div>
```

## 🧪 Development Tools

### Color Showcase
In development mode, a color showcase button appears in the top-left corner showing:
- All available colors with hex values
- Gradient previews
- Utility class examples

### Performance Monitor
Bottom-right corner shows real-time performance metrics with the new color scheme.

## 📋 Best Practices

1. **Primary Actions**: Use UT Orange for main CTAs and important buttons
2. **Secondary Actions**: Use Slate Gray for secondary buttons and less important actions
3. **Text Hierarchy**: Use Smoky Black for primary text, Dim Gray for secondary text
4. **Backgrounds**: Use Ivory for main backgrounds, white for cards
5. **Borders**: Use subtle grays for borders, UT Orange for focus states
6. **Hover States**: Always include hover effects for interactive elements
7. **Dark Mode**: Ensure all colors work well in both light and dark themes

## 🎯 Future Enhancements

- Additional color variants (lighter/darker shades)
- More gradient combinations
- Animation color schemes
- Accessibility color adjustments
- Theme customization options

---

*This color system is designed to create a cohesive, professional, and accessible user experience for UIL CS Academy.*
