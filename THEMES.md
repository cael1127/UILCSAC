# UIL CS Academy Theme System

This document explains the new theme system that allows you to switch between different color palettes.

## Available Themes

### 1. UT Orange (Default)
- **Primary**: UT Orange (#fb8b24)
- **Background**: Ivory (#f4f9e9)
- **Text**: Smoky Black (#0a0903)
- **Description**: The original UT-inspired theme with warm orange accents

### 2. Warm Sunset
- **Primary**: Bittersweet (#ff785a)
- **Background**: Maize (#fff05a)
- **Text**: Eerie Black (#191919)
- **Description**: Warm, energetic sunset colors with vibrant yellows and oranges

### 3. Ocean Vibes
- **Primary**: Sea Green (#00916e)
- **Background**: Electric Blue (#65def1)
- **Text**: Eerie Black (#191919)
- **Description**: Cool, refreshing ocean colors with blues and greens

### 4. Bondi Blue
- **Primary**: Bondi Blue (#0087ac)
- **Background**: Ivory (#f4f9e9)
- **Text**: Eerie Black (#191919)
- **Description**: Professional blue theme with clean, modern aesthetics

## How to Use

### Theme Switcher
1. Look for the **palette icon** (🎨) in the bottom-right corner of the homepage
2. Click it to open the theme selection panel
3. Choose from the four available themes
4. Your selection is automatically saved to localStorage

### Theme Persistence
- Your chosen theme is saved in the browser's localStorage
- The theme will persist across page reloads and browser sessions
- Each theme applies to the entire application consistently

## Technical Implementation

### CSS Variables
Each theme defines its own set of CSS custom properties:
- `--background`: Main background color
- `--foreground`: Main text color
- `--primary`: Primary accent color
- `--secondary`: Secondary accent color
- `--muted`: Muted text and background colors
- `--card`: Card background colors
- `--border`: Border colors

### Theme Classes
Themes are applied using CSS classes on the `:root` element:
- `.theme-ut-orange`
- `.theme-warm-sunset`
- `.theme-ocean-vibes`
- `.theme-bondi-blue`

### Utility Classes
Each theme provides utility classes for colors:
- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-background`, `text-foreground`
- `bg-muted`, `text-muted-foreground`

## Customization

### Adding New Themes
To add a new theme:

1. **Define CSS Variables** in `app/globals.css`:
```css
:root {
  --new-color-1: #color1;
  --new-color-2: #color2;
  /* ... */
}
```

2. **Create Theme Class**:
```css
.theme-new-theme {
  --background: var(--new-color-1);
  --foreground: var(--new-color-2);
  /* ... */
}
```

3. **Add to Theme Switcher** in `components/theme-switcher.tsx`:
```typescript
const themes = [
  // ... existing themes
  {
    id: 'theme-new-theme',
    name: 'New Theme',
    description: 'Description of new theme',
    icon: IconComponent,
    gradient: 'gradient-new-theme',
    primaryColor: 'bg-new-color-1',
    secondaryColor: 'bg-new-color-2'
  }
]
```

4. **Add Utility Classes**:
```css
.bg-new-color-1 { background-color: var(--new-color-1); }
.text-new-color-1 { color: var(--new-color-1); }
.border-new-color-1 { border-color: var(--new-color-1); }
```

### Modifying Existing Themes
Edit the CSS variables in the respective theme class in `app/globals.css`:

```css
.theme-ut-orange {
  --primary: #new-orange-color;
  --background: #new-background-color;
  /* ... */
}
```

## Best Practices

### Color Accessibility
- Ensure sufficient contrast between text and background colors
- Test themes with accessibility tools
- Consider colorblind users when choosing color combinations

### Consistent Usage
- Use CSS variables instead of hardcoded colors
- Apply themes consistently across all components
- Test all themes on different screen sizes

### Performance
- Theme switching is instant and doesn't require page reloads
- CSS variables provide efficient theming
- Minimal JavaScript overhead for theme management

## Troubleshooting

### Theme Not Applying
- Check browser console for CSS errors
- Verify theme class is applied to `:root` element
- Clear localStorage and refresh page

### Colors Not Updating
- Ensure components use CSS variables instead of hardcoded colors
- Check for conflicting CSS rules with `!important`
- Verify theme class is correctly applied

### Theme Switcher Not Visible
- Check z-index values
- Ensure component is imported and rendered
- Verify no CSS conflicts hiding the component

## Examples

### Using Theme Colors in Components
```tsx
// ✅ Good - Using CSS variables
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Click me
  </Button>
</div>

// ❌ Bad - Hardcoded colors
<div className="bg-ivory text-smoky-black">
  <Button className="bg-[var(--primary)] text-[var(--primary-foreground)]">
    Click me
  </Button>
</div>
```

### Theme-Aware Styling
```tsx
// Theme-aware component
<div className={`
  p-4 rounded-lg
  bg-card text-card-foreground
  border border-border
  hover:bg-accent hover:text-accent-foreground
`}>
  Content
</div>
```

This theme system provides a flexible and maintainable way to customize the application's appearance while ensuring consistency across all components.
