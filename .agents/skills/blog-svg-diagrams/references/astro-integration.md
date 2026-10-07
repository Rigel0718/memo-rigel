# Astro Integration

Use this reference when adding or updating an SVG diagram in a blog article.

## Asset location

Store diagram assets under:

```text
public/diagrams/
```

Use descriptive kebab-case filenames.

For theme-aware diagrams, follow `theme-integration.md` and create matching light and dark assets.

## Article integration

Before adding a diagram, inspect:

- `astro.config.ts` for the current `base` configuration
- existing articles for the project's asset-path convention
- the current theme-aware diagram integration when light/dark variants are used

Do not hardcode an assumed base path.

Use descriptive Markdown alt text that explains what the diagram represents.

## Semantic source

Keep an LLM-readable representation of the diagram near the rendered image.

Prefer:

- Mermaid for sequences and flows
- structured Markdown when Mermaid cannot represent the architecture accurately

When raw Mermaid should remain visible without being rendered, place it in a fenced `text` block inside a collapsible `<details>` section.

The semantic source and SVG must describe the same important structure and relationships.

Do not place generated SVG XML in the article as the semantic source.

## Validation

For SVG-only changes:

- inspect the targeted diff
- validate SVG syntax
- check that labels and arrows fit correctly

When Markdown integration, rendering behavior, configuration, or Content Collection behavior changes, run:

```bash
npm run build
```

When visual verification is available, check the diagram at desktop and mobile widths and verify theme switching when relevant.

Do not claim visual or theme verification that was not actually performed.