---
name: blog-svg-diagrams
description: Create and maintain clear, technically accurate SVG diagrams for this AstroPaper technical blog. Use when creating, editing, or integrating architecture diagrams, sequence diagrams, flows, process diagrams, or other technical visuals. Preserve the blog's visual language and an LLM-readable semantic source, and load project-specific references only when needed.
---

# Blog SVG Diagrams

Create clear, technically accurate SVG diagrams that help readers understand technical concepts at a glance.

The diagram is a visual aid for the article, not a replacement for its explanation.

## 1. Understand before drawing

Before designing a diagram:

1. Read `PROJECT.md` and the relevant article.
2. Identify the single concept the diagram should communicate.
3. Inspect existing diagrams under `public/diagrams/` for the blog's visual language.
4. Choose the representation that best matches the concept.

Use:

- **Architecture** for boundaries and responsibilities.
- **Sequence** for chronological interactions.
- **Flowchart** for decisions and control flow.
- **Process/tree** for ownership and parent-child relationships.

Do not force a concept into a diagram type that makes it less accurate.

If the article's description is technically ambiguous or misleading, preserve the correct technical distinction rather than reproducing the ambiguity.

## 2. Design for understanding

Each diagram should communicate **one primary concept**.

Prefer:

- 3–5 major visual elements when possible.
- Clear hierarchy and reading order.
- Consistent spacing and alignment.
- Restrained use of color.
- Short, meaningful labels.
- Purposeful whitespace.

Use position, grouping, labels, boundaries, and line styles to communicate meaning before relying on color.

Avoid:

- Visualizing every detail from the article.
- Dense networks of arrows.
- Long explanations inside the diagram.
- Tiny text.
- Decorative elements that do not communicate meaning.

If a diagram becomes difficult to understand without explanation, simplify it or split it into multiple diagrams.

Visual clarity takes priority over information density.

## 3. Preserve technical accuracy

Simplify presentation, not meaning.

Important participants, boundaries, directions, ordering, and ownership relationships must remain technically correct.

Do not introduce a visual structure that implies behavior that does not actually exist.

When a useful diagram requires conceptual simplification, make that simplification explicit in the surrounding article, caption, or annotation.

Keep meaningful labels as SVG `<text>` elements and maintain an accessible reading order.

## 4. Follow the blog's visual language

Existing diagrams are visual references, not immutable templates.

Reuse the blog's established conventions where they improve consistency:

- typography
- spacing
- border treatment
- accent usage
- arrow styles
- grouping
- light/dark presentation

Do not copy an existing layout when a different structure communicates the concept better.

The diagram should remain readable at normal article width and mobile width.

## 5. Preserve an LLM-readable semantic source

The SVG must not become the only representation of the concept.

When integrating a diagram into an article, keep a compact textual representation of the same diagram nearby.

Prefer:

- Mermaid for sequences and flows.
- Structured Markdown for custom architecture diagrams that Mermaid cannot represent accurately.

The semantic source and SVG must agree on the important:

- participants
- boundaries
- relationships
- directions
- ordering
- labels

Update both together when the diagram changes.

Do not embed generated SVG XML in the article merely to preserve semantics.

## 6. Use references only when needed

Do not load every reference for every diagram.

Read the relevant reference when the task requires implementation details beyond the core design principles in this skill.

### `references/visual-design.md`

Read when:

- creating a new visual style or unfamiliar diagram structure
- deciding typography, spacing, arrow, boundary, or annotation conventions
- a diagram is becoming visually dense
- mobile readability is difficult
- accessibility or contrast needs closer inspection

Contains detailed visual and accessibility conventions.

### `references/theme-integration.md`

Read when:

- creating or changing light/dark SVG variants
- integrating an SVG with the blog's manual theme toggle
- deciding between external SVG variants, inline SVG, or other theme-aware approaches
- theme behavior is unclear or existing behavior has changed

Contains AstroPaper-specific theme integration details and constraints.

### `references/astro-integration.md`

Read when:

- adding an SVG to a Markdown article
- determining the correct asset/base path
- adding the collapsible semantic source
- changing Markdown rendering or Content Collection behavior
- deciding which validation or build command is required

Contains project-specific integration and validation procedures.

### Domain-specific references

Read a domain reference only when the diagram depends on technical distinctions that are easy to misrepresent visually.

For example, an OS/process reference may contain rules for:

- syscall boundaries
- user/kernel mode transitions
- `fork()` vs `execve()`
- file descriptors and process relationships

Do not load domain-specific references for unrelated diagrams.

## 7. Workflow

1. Read the relevant article and project context.
2. Identify the diagram's single teaching objective.
3. Inspect existing diagrams for visual context.
4. Choose the appropriate representation.
5. Load additional references only when the task requires them.
6. Create or update the SVG.
7. Keep the semantic source synchronized.
8. Validate the changed diagram and its integration.

Keep changes scoped to the diagram, its semantic representation, and the minimum integration required.

## Deliverables

When an article is in scope:

- create or update the SVG under `public/diagrams/`
- integrate it into the article
- preserve the nearby LLM-readable semantic source

When only a diagram is requested:

- create or update the SVG
- provide the integration snippet when useful

In the final summary, briefly state:

- what changed
- where the semantic source lives
- how theme handling works when relevant
- any intentional technical simplifications
- anything that could not be visually verified