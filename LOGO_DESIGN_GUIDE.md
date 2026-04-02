# GoXpress Logo Design Guide

## 🎨 Logo Concept

The GoXpress logo combines speed, technology, and commerce into a modern, professional design.

### Design Elements:
- **Icon:** Lightning bolt inside a hexagon
- **Typography:** Bold sans-serif with emphasized "X"
- **Colors:** Orange (#FF8D2F) and Navy (#1F2A44)
- **Style:** Flat, minimal, scalable

---

## 📁 Logo Variations

### 1. **logo-full.svg** (180x48px)
- Full logo with icon, text, and tagline
- Use in: Headers, landing pages, marketing materials
- Best for: Desktop views, large displays

### 2. **logo-simple.svg** (140x40px)
- Icon + text only (no tagline)
- Use in: Navbar, sidebar (expanded), login page
- Best for: Most UI contexts

### 3. **logo-icon.svg** (48x48px)
- Icon only (hexagon + lightning)
- Use in: Sidebar (collapsed), mobile menu, app icon
- Best for: Small spaces, square formats

### 4. **favicon.svg** (32x32px)
- Compact square version
- Use in: Browser tab icon, PWA icon
- Best for: Tiny displays

### 5. **logo-dark.svg** (180x48px)
- Dark mode version with light text
- Use in: Dark theme UI
- Best for: Night mode, dark backgrounds

---

## 🎨 Color Palette

### Primary Colors:
```
Orange (Brand):    #FF8D2F
Navy (Text):       #1F2A44
White:             #FFFFFF
```

### Dark Mode:
```
Orange (Brand):    #FF8D2F (same)
Light Text:        #E6ECF5
Muted Text:        #97A5BA
```

---

## 🔤 Typography

**Font Family:** Inter, Segoe UI, sans-serif
**Weights:**
- Logo text: 700 (Bold)
- Tagline: 500 (Medium)

**Special Treatment:**
- "Go" - Navy color
- "X" - Orange color (brand accent)
- "press" - Navy color

---

## ⚡ Icon Symbolism

### Hexagon:
- Represents structure and stability
- Modern tech aesthetic
- Scalable geometric shape

### Lightning Bolt:
- Speed and efficiency
- Instant service
- Energy and power
- Forward motion

---

## 📐 Usage Guidelines

### ✅ DO:
- Use on white or light backgrounds (light mode)
- Use dark version on dark backgrounds
- Maintain aspect ratio when scaling
- Keep minimum size of 100px width for full logo
- Use icon-only version for spaces under 100px

### ❌ DON'T:
- Stretch or distort the logo
- Change colors (except for dark mode)
- Add effects (shadows, gradients, etc.)
- Place on busy backgrounds
- Use low-resolution versions

---

## 📱 Responsive Behavior

### Desktop (>1024px):
- Use `logo-full.svg` or `logo-simple.svg`
- Full text visible

### Tablet (768px - 1024px):
- Use `logo-simple.svg`
- Tagline optional

### Mobile (<768px):
- Use `logo-icon.svg` in collapsed sidebar
- Use `logo-simple.svg` in expanded menu

---

## 🎯 Implementation

### Sidebar:
```jsx
<img src="/logo-simple.svg" alt="GoXpress" className="gxp-logo" />
```

### Favicon:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

### Landing Page:
```jsx
<img src="/logo-full.svg" alt="GoXpress" />
```

### Dark Mode:
```jsx
{theme === 'dark' ? (
  <img src="/logo-dark.svg" alt="GoXpress" />
) : (
  <img src="/logo-simple.svg" alt="GoXpress" />
)}
```

---

## 🔄 File Formats

All logos are provided as **SVG** (Scalable Vector Graphics):
- ✅ Infinitely scalable
- ✅ Small file size
- ✅ Sharp on all displays
- ✅ Retina-ready
- ✅ Easy to modify colors

---

## 🎨 Brand Personality

The GoXpress logo conveys:
- **Speed:** Lightning bolt, forward motion
- **Reliability:** Hexagon structure, solid colors
- **Modern:** Flat design, clean typography
- **Professional:** Balanced composition, quality execution
- **Tech-Forward:** Geometric shapes, bold sans-serif

---

## 📊 Logo Specifications

| Variation | Width | Height | Use Case |
|-----------|-------|--------|----------|
| Full | 180px | 48px | Headers, landing |
| Simple | 140px | 40px | Navbar, sidebar |
| Icon | 48px | 48px | Collapsed sidebar |
| Favicon | 32px | 32px | Browser tab |
| Dark | 180px | 48px | Dark mode |

---

## 🚀 Quick Start

1. **Replace current logo:**
   - Update `frontend/public/logo.png` with new SVG
   - Or use SVG directly in components

2. **Update Sidebar:**
   ```jsx
   <img src="/logo-simple.svg" alt="GoXpress" className="gxp-logo" />
   ```

3. **Update Favicon:**
   ```html
   <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
   ```

4. **Update Landing Page:**
   ```jsx
   <img src="/logo-full.svg" alt="GoXpress" />
   ```

---

## 🎯 Design Rationale

### Why Hexagon?
- Modern, tech-forward shape
- Stable and balanced
- Distinctive and memorable
- Works well at small sizes

### Why Lightning Bolt?
- Universal symbol for speed
- Conveys instant service
- Dynamic and energetic
- Fits "Xpress" brand name

### Why Orange?
- Energetic and friendly
- Stands out from competitors
- Associated with action and speed
- Warm and approachable

### Why Navy?
- Professional and trustworthy
- Tech industry standard
- Good contrast with orange
- Readable and clear

---

*Logo designed for GoXpress POS System - March 2026*
