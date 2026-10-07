import type { MarkdownHeading } from "astro";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

export interface LlmCopyData {
  title: string;
  markdown: string;
  sections: { id: string; start: number; end: number }[];
}

const parser = unified().use(remarkParse).use(remarkGfm);

interface MarkdownNode {
  type: string;
  value?: string;
  children?: MarkdownNode[];
  position?: { start: { offset?: number }; end: { offset?: number } };
}

/** Remove images and diagram presentation markup without rewriting Markdown. */
function cleanMarkdown(body: string): string {
  const removals: { start: number; end: number }[] = [];
  const visit = (node: MarkdownNode) => {
    if (
      (node.type === "image" || node.type === "imageReference") &&
      node.position
    ) {
      removals.push({
        start: node.position.start.offset!,
        end: node.position.end.offset!,
      });
      return;
    }
    if (node.type === "html" && node.position) {
      const start = node.position.start.offset!;
      const html = body.slice(start, node.position.end.offset!);
      const nodeRemovals: { start: number; end: number; image: boolean }[] = [];
      const patterns = [
        /^[\t ]*<\/?details\s*>[\t ]*(?=\r?$)/gim,
        /<summary>\s*다이어그램 원본 보기\s*\(Mermaid\)\s*<\/summary>/gi,
        /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi,
      ];
      for (const pattern of patterns) {
        for (const match of html.matchAll(pattern)) {
          const tag = match[0];
          nodeRemovals.push({
            start: match.index,
            end: match.index + tag.length,
            image: /^<img\b/i.test(tag),
          });
        }
      }
      // Only discard a not-prose wrapper made empty by removing images.
      // Meaningful HTML, unrelated empty divs and code nodes remain untouched.
      const wrappers =
        /(<div\b(?:[^>"']|"[^"]*"|'[^']*')*>)([\s\S]*?)<\/div\s*>/gi;
      for (const match of html.matchAll(wrappers)) {
        const classes =
          /\bclass\s*=\s*["']([^"']*)["']/i.exec(match[1])?.[1].split(/\s+/) ??
          [];
        if (!classes.includes("not-prose")) continue;
        const contentStart = match.index + match[1].length;
        const contentEnd = contentStart + match[2].length;
        const contained = nodeRemovals.filter(
          (range) => range.start >= contentStart && range.end <= contentEnd,
        );
        if (!contained.some((range) => range.image)) continue;
        let content = match[2];
        for (const range of contained.sort((a, b) => b.start - a.start)) {
          content =
            content.slice(0, range.start - contentStart) +
            content.slice(range.end - contentStart);
        }
        if (content.trim()) continue;
        // Replace contained ranges with one whole-wrapper range, without overlaps.
        for (const range of contained)
          nodeRemovals.splice(nodeRemovals.indexOf(range), 1);
        nodeRemovals.push({
          start: match.index,
          end: match.index + match[0].length,
          image: false,
        });
      }
      removals.push(
        ...nodeRemovals.map((range) => ({
          start: start + range.start,
          end: start + range.end,
        })),
      );
    }
    node.children?.forEach(visit);
  };
  visit(parser.parse(body));
  // Edit source ranges, never stringify the AST or rewrite code/Markdown.
  let markdown = body;
  for (const { start, end } of removals.sort((a, b) => b.start - a.start)) {
    markdown = markdown.slice(0, start) + markdown.slice(end);
  }
  return markdown;
}

function headingText(node: MarkdownNode): string {
  if (node.type === "inlineCode") return node.value ?? "";
  if (node.type === "text") return (node.value ?? "").replace(/\{/g, "${");
  return node.children?.map(headingText).join("") ?? "";
}

// Astro's smartypants changes typography in rendered text, not in the source.
function comparableHeading(text: string): string {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/[–—]|-{2,3}/g, "-");
}

export function createLlmCopyData(
  body: string,
  title: string,
  headings: MarkdownHeading[],
): LlmCopyData {
  const markdown = cleanMarkdown(body);
  const chapters = parser
    .parse(markdown)
    .children.filter((node) => node.type === "heading" && node.depth === 2);
  const renderedChapters = headings.filter((heading) => heading.depth === 2);
  if (
    chapters.length !== renderedChapters.length ||
    chapters.some(
      (chapter, index) =>
        comparableHeading(headingText(chapter)) !==
        comparableHeading(renderedChapters[index].text),
    )
  ) {
    throw new Error(
      `Copy for LLM: H2 headings do not match rendered headings in "${title}".`,
    );
  }
  return {
    title,
    markdown,
    sections: chapters.map((chapter, index) => ({
      id: renderedChapters[index].slug,
      start: chapter.position!.start.offset!,
      end: chapters[index + 1]?.position?.start.offset ?? markdown.length,
    })),
  };
}

/** Safe inside an HTML script data block, including literal </script> in code. */
export function serializeLlmCopyData(data: LlmCopyData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
