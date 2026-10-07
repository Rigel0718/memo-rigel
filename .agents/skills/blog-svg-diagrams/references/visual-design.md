# Visual Design

Use this reference when creating a new diagram or when the layout becomes difficult to read.

These are guidelines, not fixed templates. Prefer the clearest representation for the concept.

## Layout

Make the reading direction obvious.

Prefer simple structures such as:

- left → right for flows
- top → bottom for layers or sequences
- parent → child for ownership

Keep related elements close together and use whitespace to separate different groups.

Avoid unnecessary arrow crossings. If the layout requires many crossing arrows or annotations, simplify or split the diagram.

## Visual elements

Use a small, consistent set of visual conventions.

- Keep labels short.
- Use consistent typography and spacing.
- Use containers only when the boundary has technical meaning.
- Use arrows only for meaningful relationships.
- Label relationships when their meaning is not obvious.
- Use color sparingly and never as the only way to distinguish concepts.
- Keep meaningful labels as SVG `<text>` elements.

Follow existing diagrams for typography, spacing, borders, accent colors, and arrow styles when appropriate.

Existing diagrams are references, not templates.

## Readability

The primary concept should be understandable before the reader examines every label.

Prefer a small number of major visual elements and remove details that belong in the article.

Do not shrink a complex desktop diagram until its text becomes unreadable on mobile. Simplify, rearrange, or allow horizontal scrolling when necessary.

Include meaningful `<title>` and `<desc>` elements and maintain sufficient contrast.

Before finishing, check:

- Is the reading direction obvious?
- Are the important relationships clear?
- Are any labels unnecessarily long?
- Are arrows or boundaries ambiguous?
- Can anything be removed without losing the concept?

Prefer the simplest diagram that preserves the technical meaning.