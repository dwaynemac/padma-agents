---
name: derose-brand
description: Design or redesign UI so it respects the DeROSE brand across product, marketing, and institutional surfaces. Use when Codex needs to create mockups, front-end implementations, component systems, dashboards, pricing pages, landing pages, or visual refreshes that should match DeROSE visual language, including requests to "make this feel like DeROSE", "match the Learn DeROSE brand", or apply DeROSE styling to an existing interface.
---

# DeROSE Brand

## Overview

Apply the shared DeROSE visual system without collapsing every screen into a single template.
Use the brand palette, editorial typography, restrained CTAs, and institutional tone as defaults, then pull site-specific patterns only when the product context calls for them.

## Core Workflow

1. Identify the surface: app UI, dashboard, marketing page, pricing page, local school site, or institutional site.
2. Start from the shared DeROSE rules: deep blue structure, white canvas, gold accent, editorial headings, clean body copy.
3. Choose the closest reference mode:
   - Learn-inspired for operational product UI
   - Apps-inspired for minimal routing or chooser pages
   - Cervino-inspired for local school trust and conversion pages
   - Method-inspired for editorial storytelling and institutional marketing
4. Keep the result elegant and restrained rather than startup-loud or trend-driven.
5. Verify that brand traits stay visible even if the layout or feature set is new.

## Shared Brand Rules

- Treat `#040e85` as the primary structural color. Use it for navigation, anchors, key headings, active states, and brand-signature surfaces.
- Treat `#ffffff` as the main canvas. Prefer light interfaces with clean whitespace and strong contrast.
- Treat `#c69c6c` as the accent or editorial color. Use it sparingly for emphasis, separators, badges, highlights, or decorative support.
- Use `Sanomat Web` for brand headings when available. The observed DeROSE implementation loads it from `Sanomat-LightItalic-Web.woff2` and `Sanomat-LightItalic-Web.woff` as `font-weight: 300` and `font-style: italic`.
- Apply `Sanomat Web` to `h1`, `h2`, and brand-title treatments rather than to all text.
- Use `Helvetica, sans-serif` for body copy and controls, matching the observed `--brand-body-font-family`.
- Preserve institutional polish: calm rhythm, clear sections, measured spacing, and deliberate hierarchy.
- Keep CTAs modest. Favor small or medium buttons, repeated calls to action, and contextual prompts over giant hero buttons.

## Layout Guidance

- Favor strong top-level navigation and visible orientation rather than hidden IA.
- Use sections with clear horizontal rhythm. For product and content feeds, curated rows, sliders, or grouped blocks are appropriate.
- Prefer cards with soft edges, light shadows, and disciplined spacing.
- Keep the interface dense enough to feel functional, but not crowded.
- For pricing, FAQ, and local-school pages, pair editorial headings with straightforward operational blocks.

## Tone and Interaction

- Make motion subtle and purposeful. Use hover shifts, fades, and gentle transitions instead of playful or exaggerated animation.
- Keep copy tone poised, clear, and confident. Avoid gimmicky marketing language and playful UI jokes.
- Let the brand feel premium through restraint, not ornament overload.

## Guardrails

- Do not default to purple-on-white SaaS styling.
- Do not make dark mode or dark-first UI the default unless the source product already uses it.
- Do not replace `Sanomat Web` heading usage with generic sans-serif headings.
- Do not rely on oversized hero buttons, oversized chips, or shouty promotional banners.
- Do not overpack cards with badges, gradients, and competing accents.
- Do not make the UI playful, noisy, or trend-chasing.
- Do not force Learn-specific carousels into every page. Use site-specific patterns only when they fit the surface.

## Load References Selectively

- Shared rules and do/don't guidance: `references/brand-rules.md`
- Concrete patterns from the DeROSE sites: `references/site-examples.md`

Open only what is needed for the current design task.

## Usage Notes

- For dashboards and app flows, bias toward Learn DeROSE's operational clarity, fixed navigation, compact controls, and curated block structure.
- For marketing and institutional pages, bias toward larger editorial sections, trust-building content, and measured CTA repetition.
- If a user asks for "DeROSE brand" without naming a product, start with the shared rules before borrowing from any one site.
- Font source of truth for this skill: `/Users/dwaynemac/GitHub/derosecervino/assets/stylesheets/brand.css.scss` and the font files `/Users/dwaynemac/GitHub/derosecervino/assets/fonts/Sanomat-LightItalic-Web.woff2` and `/Users/dwaynemac/GitHub/derosecervino/assets/fonts/Sanomat-LightItalic-Web.woff`.
