---
name: figma
description: Implement UI from Figma designs using MCP tools. Use when a prompt includes a Figma link, or when implementing/updating UI components based on a Figma design.
---

# Figma Design Implementation

## Figma MCP Usage

- **When a prompt includes a Figma link** (`https://figma.com/...`), use Figma MCP to open and inspect the design first.
- **If MCP cannot access the design** (auth, permissions, network, or node issues), **do not proceed** or "imagine" the design. **Stop and briefly explain** why the MCP connection failed and what access is needed.
- **Never implement UI "according to the design" without actually retrieving it via MCP** (e.g., code, metadata, or screenshot) in this session.
- **Use existing color tokens** from this codebase's semantic HSLA system.
  - Colors are defined in `lib/ui/theme/ThemeColors.ts` and implemented in `lib/ui/theme/darkTheme.ts`.
  - In styled-components: use `getColor('tokenName')` from `@lib/ui/theme/getters`.
  - As component props: use `ThemeColor` type (e.g., `color="primary"`, `bgColor="foreground"`).
  - Key token categories:
    - **Text**: `text`, `textSupporting`, `textShy`
    - **Semantic**: `primary`, `success`, `danger`, `info`, `idle`
    - **Surfaces**: `background`, `foreground`, `foregroundExtra`, `foregroundSuper`
    - **Buttons**: `buttonPrimary`, `buttonSecondary`, `buttonNeutral`
- **Never hardcode hex values** from Figma. Always find the matching semantic token in `lib/ui/theme/darkTheme.ts`.
- **When a Figma color doesn't match any token**, stop and ask rather than guessing.

## Mandatory Design-to-Code Mapping

Before writing ANY implementation code from a Figma design, you MUST extract and explicitly list a property mapping table in the plan. Do NOT skip this step. Do NOT guess or assume values.

### 1. Extract every property from every element

For EACH element in the Figma `get_design_context` output, extract:

- **Colors**: Read the exact color on every element (backgrounds, borders, text, icons). Map each to a codebase semantic color token. Do NOT reuse a "similar" token — use the exact one from the design.
- **Spacing**: Read the exact `gap`, `padding`, and `margin` pixel values between every pair of adjacent elements. Different gaps between different elements mean nested containers with different gap values — never flatten into a single gap.
- **Dimensions**: Read exact `height`, `width`, `min-height` values. Cross-reference with codebase component size props (e.g., Button `size="md"` = 46px height).
- **Typography**: Read the font size, weight, and color. Map to the `Text` component props.

### 2. Present the mapping table in the plan

Use this format:

```
| Element        | Figma Property | Figma Value    | Code Prop/Token                  |
|----------------|---------------|----------------|----------------------------------|
| Icon           | color         | (from design)  | getColor('contrast')             |
| Message        | color         | (from design)  | Text color="supporting"          |
| Button         | bg            | (from design)  | Button kind="secondary"          |
| Button         | height        | 46px           | Button size="md"                 |
| Icon<>Message  | gap           | 8px            | VStack gap={8}                   |
| Message<>Btn   | gap           | 24px           | VStack gap={24}                  |
```

### 3. Cross-reference component props with Figma values

When the design uses a known codebase component (Button, Text, etc.):

- **Button kind**: Match the Figma button's background and border colors against the theme tokens in `lib/ui/theme/darkTheme.ts`.
  - `primary`: uses `buttonPrimary`
  - `secondary`: uses `buttonSecondary`
  - `outlined`: uses transparent background with border
- **Button size**: Match the Figma button's `height` against codebase definitions:
  - `Button`: `sm` (36px), `md` (46px)
  - `IconButton`: `xs` (24px), `sm` (28px), `md` (32px), `lg` (40px), `xl` (52px)
- **Typography**: Use the `Text` component from `@lib/ui/text`.
  - **First check if the Figma style name matches a `TextVariant`** (see Typography Variants below). If it does, use `variant="..."` instead of setting individual props.
  - If no variant matches, map font size to `size` prop, weight to `weight` prop, and text color to `color` prop.
  - If Figma shows a named style that is NOT yet in `textVariantsRecord`, **create a new variant** in `lib/ui/text/index.tsx` before using raw props. This keeps the design system in sync.

### 4. Never assume defaults

- Do NOT assume an icon color matches surrounding text color — check the icon's own color.
- Do NOT assume all gaps between elements are the same — check each pair individually.
- Do NOT assume a component size prop without checking the Figma height in pixels.
- Do NOT pick the "closest" value — use the exact value from the design.

## Typography Variants

The `Text` component supports named `variant` props that map to Figma's named typography styles. **Always use a variant when the Figma style name matches one in this table.**

| Figma Style Name          | `variant` prop | size | weight | line-height | letter-spacing |
|---------------------------|----------------|------|--------|-------------|----------------|
| Hero/H1                   | `h1Hero`       | 54   | 500    | 1.5         | —              |
| Regular/H1                | `h1Regular`    | 42   | 500    | 1.5         | —              |
| Supplementary/Footnote    | `footnote`     | 13   | 500    | 1.385       | 0.06px         |

### Usage

```tsx
// Figma shows "Supplementary/Footnote" style → use variant
<Text variant="footnote" color="shy">Description text</Text>

// Figma shows a style NOT in the table → create a new variant first
// 1. Add to TextVariant type in lib/ui/text/index.tsx
// 2. Add to textVariantsRecord with exact Figma values
// 3. Then use it: <Text variant="newVariant" color="...">
```

### Rules

- `color` is always set separately via the `color` prop — variants do NOT include color (Figma typography styles and colors are independent).
- When a Figma design uses a named typography style (visible in the Figma inspector as a style name like "Supplementary/Footnote"), you MUST use the corresponding variant.
- If the named style is missing from `textVariantsRecord`, **add it** before proceeding. Do NOT use raw `size`/`weight` props to approximate a named style.
- The `height` prop accepts both named presets (`small`, `regular`, `large`) and numeric line-height ratios (e.g., `1.385`). Use the exact ratio from Figma when adding new variants.

## Icon Sourcing

Figma MCP does **not** reliably export SVG icon paths. When implementing a design with icons:

1. **Check if the icon already exists** in `lib/ui/icons/`. Search by visual description or name.
2. **If the icon does NOT exist**, ask the user to provide the exact SVG from Figma. Say: *"I need the SVG for [icon description]. Could you paste it from Figma?"*
3. **Never approximate, invent, or use a "similar" icon.** The exact SVG from the design must be used.
4. When creating a new icon from user-provided SVG, follow the `svg-icon-pattern` skill.

## Key Component References

Consult these files for implementation details:

- **Colors**: `lib/ui/theme/ThemeColors.ts`, `lib/ui/theme/darkTheme.ts`, `lib/ui/theme/getters.ts`
- **Typography**: `lib/ui/text/index.tsx` (includes `TextVariant` and `textVariantsRecord`)
- **Buttons**: `lib/ui/buttons/Button/index.tsx`, `lib/ui/buttons/IconButton/index.tsx`
- **Layout**: `lib/ui/layout/Stack/index.tsx` (VStack, HStack)
- **Icons**: `lib/ui/icons/` (follow `svg-icon-pattern` skill)
- **Pages**: `lib/ui/page/` (`PageContent`, `PageHeader`, `PageFooter`, `PageSlice`)
