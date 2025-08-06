# THEME_GUIDELINE.md

**Project**: Influmeter  
**Version**: 1.0  
**Last Updated**: 2025-08-01  
**Applies To**:  
- Frontend (React Web)
- Mobile (Flutter App)
- Internal Admin UI (if any)

---

## 🎨 Color Palette

| Purpose           | Color          | Hex Code   | Usage                                     |
|------------------|----------------|------------|-------------------------------------------|
| Primary          | Kenyan Indigo  | #2E3A59    | Main buttons, headers, highlights         |
| Accent           | Tuscan Yellow  | #F4B400    | CTAs, active tabs, important badges       |
| Success          | Emerald Green  | #34A853    | Success messages, verified influencers    |
| Error            | Flame Red      | #EA4335    | Error states, warnings                    |
| Background Light | Cloud White    | #FAFAFA    | Page backgrounds                          |
| Text Primary     | Charcoal       | #202124    | Main content text                         |
| Text Muted       | Grey           | #5F6368    | Captions, timestamps, placeholders        |

---

## 🔤 Typography

**Primary Font**: `Inter`  
**Secondary Font**: `Poppins` (for headers, branding)

| Element       | Font    | Weight | Size    | Usage                      |
|---------------|---------|--------|---------|----------------------------|
| Headline 1    | Poppins | 700    | 36px    | Page titles, dashboard top |
| Headline 2    | Poppins | 600    | 28px    | Section titles             |
| Subtitle      | Inter   | 500    | 20px    | Campaign card headings     |
| Body Text     | Inter   | 400    | 16px    | Paragraphs, post copy      |
| Caption       | Inter   | 400    | 13px    | Timestamps, hints          |

---

## 🧱 Spacing and Layout

| Unit           | Value      | Usage                        |
|----------------|------------|------------------------------|
| Base spacing   | 8px grid   | Padding, margins, gaps       |
| Card padding   | 16px       | Influencer cards, tables     |
| Section gap    | 32px       | Between major sections       |
| Button padding | 12px 24px  | Consistent CTA sizing        |

**Layout Guidelines**:
- Use **12-column grid** on desktop
- **4–8 column stack** on mobile
- Maintain breathing room around widgets

---

## 🔘 Buttons

| Type       | Style                              |
|------------|------------------------------------|
| Primary    | Solid Indigo + White text          |
| Secondary  | Outline Indigo + Text Indigo       |
| Danger     | Solid Red + White text             |
| Ghost      | Transparent + Text Indigo          |

Hover & Active states:
- Slight darkening on hover
- Slight scale (1.02x) on active

---

## 🧩 Components

All components must be built as reusable:

- `Button`
- `Card`
- `Badge`
- `Avatar`
- `Modal`
- `Tabs`
- `Toast`
- `Tooltip`
- `Progress Bar`
- `Analytics Chart`
- `Referral Code Chip`

Use shadcn/ui or Radix UI in React for consistency.

---

## 🌙 Light & Dark Mode

We will support **Light mode first**, then **Dark mode**. Use Tailwind's `dark:` variant for conditional styling.

---

## 🧑‍💻 Implementation Notes

### React (Web)
- Use TailwindCSS with custom theme
- Setup `tailwind.config.js` with color and font overrides
- Use `@/components/ui` for all reusable parts
- Route folders by feature (e.g. `/dashboard`, `/campaigns`, `/influencers`)

### Flutter (Mobile)
- Set `ThemeData` in `main.dart`
- Use GoogleFonts for Inter and Poppins
- Create reusable `Widgets/` folder for UI parts
- Respect spacing and font sizes using `MediaQuery`

### NestJS (Backend)
- Backend doesn’t apply theming directly
- Ensure API routes return clean, theme-consistent metadata (e.g., badge types, theme codes if needed)

---

## 🧪 Testing

Before launching, test themes:
- On small and large screen sizes
- In Light & Dark modes
- In RTL layout (if applicable)
- With accessibility tools (contrast ratio, font scaling)

---

## ✅ Final Notes

Stick to this guide unless the UX team approves exceptions. Visual consistency builds trust for both Brands and Influencers.

---

## 🌙 Dark Mode Support

Influmeter will support **Dark Mode** across web and mobile platforms. Light Mode will be the default, but Dark Mode can be toggled by the user or auto-triggered by system settings.

### 🌗 Color Adjustments

| Element         | Light Mode         | Dark Mode          |
|-----------------|--------------------|--------------------|
| Background      | #FAFAFA (White)    | #121212 (Almost Black) |
| Cards/Surfaces  | #FFFFFF             | #1E1E1E             |
| Text Primary    | #202124             | #FFFFFF             |
| Text Muted      | #5F6368             | #AAAAAA             |
| Accent (Yellow) | #F4B400             | #F4B400             |
| Primary Indigo  | #2E3A59             | #3F51B5             |
| Error           | #EA4335             | #FF6E6E             |

### 🌐 React (Web)
- Use Tailwind’s `dark:` variant.
- Enable dark mode by setting `darkMode: 'class'` in `tailwind.config.js`.
- Wrap app with a provider that toggles a `dark` class on `<html>` or `<body>`.

**Example:**
```html
<html class="dark"> <!-- for dark mode -->
