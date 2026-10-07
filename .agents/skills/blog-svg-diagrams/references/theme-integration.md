# Theme Integration

Use this reference when creating, editing, or integrating theme-aware SVG diagrams.

The diagram must follow the **blog's selected theme**, including when the selected theme differs from the operating system preference.

## Light and dark assets

For external SVG diagrams, create matching light and dark variants:

- `diagram-name-light.svg`
- `diagram-name-dark.svg`

Both variants must preserve the same:

- content
- geometry
- spacing
- labels
- arrow routing
- reading order

Only presentation colors should differ.

Do not independently redesign the dark variant.

## Theme selection

Use the blog's existing theme state to select the appropriate SVG.

Do not assume `prefers-color-scheme` is sufficient. The blog supports manual theme selection, which may differ from the operating system preference.

An SVG loaded through Markdown or `<img>` should not be assumed to inherit the parent page's theme classes or CSS variables.

Inspect the project's existing theme implementation before changing how diagrams are selected.

Do not introduce a separate theme state or theme manager for diagrams.

## Colors

Use the existing diagrams and blog theme as the source for appropriate light and dark colors.

Ensure that text, arrows, boundaries, and annotations remain readable in both variants.

Theme differences should affect presentation only, not the meaning or structure of the diagram.

## Validation

When theme-aware diagrams are changed, verify:

- the light theme displays the light SVG
- the dark theme displays the dark SVG
- manual theme switching changes the diagram correctly
- both variants contain the same information and layout
- labels and relationships remain readable in both themes

Do not claim that theme switching or visual appearance was verified if it was not actually checked.