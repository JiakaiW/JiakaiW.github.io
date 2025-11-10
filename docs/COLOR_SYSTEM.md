# Sophisticated Color System

## Color Harmony Strategy
**Tonal/Analogous Harmony** - Based on deep slate blues with warm earth tones and jewel accents, creating a cohesive, sophisticated palette suitable for modern, minimalist, high-end technology branding.

---

## Complete Color Palette

| Name | Hex Code | Usage | Rationale/Aesthetic Note |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `#4A9BA8` | Main branding highlight, primary CTAs, major link highlights, primary tags | Deep teal - elegant, distinctive, high-impact. Rich enough to stand out but sophisticated enough for professional contexts. |
| **Primary Accent Light** | `#6BB5C2` | Hover states, active elements | Lighter teal for interactive feedback - maintains sophistication while providing clear visual response. |
| **Primary Accent Dark** | `#3A7B88` | Depth, shadows, pressed states | Darker teal for depth and hierarchy - creates subtle layering. |
| **Secondary Accent** | `#6B7FA8` | Secondary CTAs, section highlights, progress bars | Muted indigo - complementary to primary, supporting role. Lower saturation ensures it doesn't compete with primary. |
| **Secondary Accent Light** | `#8A9FC2` | Secondary hover states | Lighter indigo for secondary interactions. |
| **Success** | `#6B9A7A` | Confirmation messages, 'complete' status, positive indicators | Muted sage green - trustworthy, subtle, non-jarring. Earthy tone conveys stability and completion. |
| **Success Text** | `#8FB8A0` | Success text on dark backgrounds | Lighter sage for optimal contrast and readability. |
| **Warning** | `#B89A6B` | Cautionary messages, fields needing attention, mild errors, scheduled items | Warm ochre - clear but not alarming or aggressive. Earthy warmth provides gentle alert without panic. |
| **Warning Text** | `#D4B88A` | Warning text on dark backgrounds | Lighter ochre for readability while maintaining warmth. |
| **Error/Danger** | `#B87A7A` | Critical errors, 'delete' actions, failed status | Muted terracotta - serious, immediate, restrained (not pure red). Sophisticated earth tone conveys urgency without being jarring. |
| **Error Text** | `#D49A9A` | Error text on dark backgrounds | Lighter terracotta for contrast. |
| **Info/Notice** | `#7A9AB8` | General information, non-critical alerts, tooltips | Soft periwinkle - calm, informative, distinct from other semantics. Blue-tinted but muted for sophistication. |
| **Info Text** | `#9AB8D4` | Info text on dark backgrounds | Lighter periwinkle for readability. |
| **Utility 1 (Lavender)** | `#8A7AA8` | Categories, tags, tensor/neural themes | Dusty lavender - harmonious jewel tone, unique saturation for differentiation. Works well in proximity with other utilities. |
| **Utility 1 Light** | `#A89AC2` | Utility 1 hover/text variants | Lighter lavender for interactive states. |
| **Utility 2 (Taupe)** | `#9A8A7A` | Categories, tags, neural theme | Warm taupe - earthy, sophisticated. Natural tone provides grounding. |
| **Utility 2 Light** | `#B8A89A` | Utility 2 hover/text variants | Lighter taupe for contrast. |
| **Utility 3 (Mint)** | `#7A9A8A` | Categories, tags | Muted mint - fresh but restrained. Provides subtle differentiation without being bright. |
| **Utility 3 Light** | `#9AB8A8` | Utility 3 hover/text variants | Lighter mint for readability. |
| **Utility 4 (Rose)** | `#A88A7A` | Categories, tags | Dusty rose - warm, elegant. Sophisticated pink-tone that complements the palette. |
| **Utility 4 Light** | `#C2A89A` | Utility 4 hover/text variants | Lighter rose for interactive states. |
| **Utility 5 (Olive)** | `#8A9A7A` | Categories, tags | Olive sage - natural, refined. Earthy green variant for additional differentiation. |
| **Utility 5 Light** | `#A8B89A` | Utility 5 hover/text variants | Lighter olive for contrast. |

---

## Color Application Map

### News Categories
- **Publication**: Success (`#6B9A7A` / `#8FB8A0`)
- **Talk**: Warning (`#B89A6B` / `#D4B88A`)
- **Software**: Primary Accent (`#4A9BA8` / `#6BB5C2`)
- **News**: Utility 1 (`#8A7AA8` / `#A89AC2`)
- **Opportunity**: Info (`#7A9AB8` / `#9AB8D4`)

### Research Theme Icons
- **Superconducting**: Primary Accent (`#4A9BA8`)
- **QEC**: Secondary Accent (`#6B7FA8`)
- **Tensor**: Utility 1 (`#8A7AA8`)
- **Neural**: Utility 2 (`#9A8A7A`)

### Project Status Badges
- **Completed**: Success (`#6B9A7A` / `#8FB8A0`)
- **Ongoing**: Warning (`#B89A6B` / `#D4B88A`)
- **Potential**: Utility 1 (`#8A7AA8` / `#A89AC2`)

### Timeline Project Bars
- **Completed**: Success (`rgb(107, 154, 122)`)
- **Ongoing**: Primary Accent (`rgb(74, 155, 168)`) or Secondary (`rgb(107, 139, 184)`)
- **Scheduled**: Warning (`rgb(184, 154, 107)`)
- **Tensor-related**: Utility 1 (`rgb(138, 122, 168)`)

---

## Design Principles

1. **Tonal Harmony**: All colors share similar lightness/saturation levels, creating visual coherence
2. **Analogous Base**: Blues/teals form the foundation, complemented by warm earth tones
3. **Jewel Accents**: Utility colors use muted jewel tones (lavender, rose) for sophistication
4. **Accessibility**: All colors meet WCAG AA standards for contrast against dark backgrounds
5. **Scalability**: 10+ distinct colors that work harmoniously together without visual clutter

---

## Implementation Notes

- Colors are defined as CSS variables in `assets/css/base/variables.css`
- Legacy aliases maintained for backward compatibility
- All colors include light variants for hover states and text on dark backgrounds
- Semantic colors (success/warning/error/info) include both base and text variants for optimal contrast

