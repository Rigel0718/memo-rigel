import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import {
  createMarkdownProcessor,
  parseFrontmatter,
} from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  createLlmCopyData,
  serializeLlmCopyData,
} from "../src/utils/copyForLlm.ts";

const renderer = await createMarkdownProcessor({
  syntaxHighlight: false,
  remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
  rehypePlugins: [rehypeCallouts],
});

async function copyData(body, title = "에피소드") {
  const rendered = await renderer.render(body);
  return createLlmCopyData(body, title, rendered.metadata.headings);
}

test("removes only diagram presentation HTML and preserves Mermaid and other HTML", async () => {
  const mermaid =
    '```text\nflowchart LR\n    A["Python<br/>Program"] --> B\n```';
  const diagram =
    '<img\n  class="dark:hidden"\n  src="/memo-rigel/diagrams/fd-light.svg"\n  alt="FD"\n/>\n<img class="hidden dark:block" src="/memo-rigel/diagrams/fd-dark.svg" alt="FD" />';
  const body = `## 장\n\n본문\n\n${diagram}\n\n<details>\n<summary>다이어그램 원본 보기 (Mermaid)</summary>\n\n${mermaid}\n\n</details>\n\n<div>의미 있는 HTML</div>\n\n<img src="/memo-rigel/photo.png" alt="사진" />\n\n<summary>의미 있는 요약</summary>\n`;
  const data = await copyData(body);
  assert.ok(!data.markdown.includes("/diagrams/"));
  assert.ok(!data.markdown.includes("<details>"));
  assert.ok(!data.markdown.includes("</details>"));
  assert.ok(!data.markdown.includes("다이어그램 원본 보기"));
  assert.ok(data.markdown.includes(mermaid));
  assert.ok(data.markdown.includes("<div>의미 있는 HTML</div>"));
  assert.ok(
    data.markdown.includes('<img src="/memo-rigel/photo.png" alt="사진" />'),
  );
  assert.ok(data.markdown.includes("<summary>의미 있는 요약</summary>"));
});

test("preserves literal presentation markup and ## inside fenced/indented/inline code", async () => {
  const body =
    '## 첫 장\n\n```html\n## 가짜 장\n<details>\n<summary>다이어그램 원본 보기 (Mermaid)</summary>\n<img class="dark:hidden" src="/memo-rigel/diagrams/fd-light.svg" />\n</details>\n```\n\n~~~python\n## 또 가짜 장\nprint("끝")\n~~~\n\n    ## 들여쓴 코드\n\n`<details>`\n\n## 마지막 장\n\n끝\n';
  const data = await copyData(body);
  assert.equal(data.markdown, body);
  assert.equal(data.sections.length, 2);
  assert.equal(
    data.markdown.slice(data.sections[0].start, data.sections[0].end),
    body.slice(0, body.indexOf("## 마지막 장")),
  );
  assert.equal(
    data.markdown.slice(data.sections[1].start, data.sections[1].end),
    "## 마지막 장\n\n끝\n",
  );
});

test("removes emptied diagram wrappers but preserves content, unrelated divs and code examples", async () => {
  const image =
    '<img class="dark:hidden" src="/memo-rigel/diagrams/example-light.svg" />';
  const wrapper = `<div class="not-prose my-8" role="group" aria-label="diagram > view">\n${image}\n</div>`;
  const meaningful = `<div class="not-prose">\n${image}\n설명은 보존\n</div>`;
  const unrelated = '<div class="not-prose my-8">\n</div>';
  const example = `\`\`\`html\n${wrapper}\n\`\`\``;
  const body = `## 첫 장\n\n${wrapper}\n\n${meaningful}\n\n${unrelated}\n\n${example}\n\n## 마지막 장\n\n끝\n`;
  const data = await copyData(body);
  assert.equal(
    data.markdown,
    body
      .replace(wrapper, "")
      .replace(meaningful, meaningful.replace(image, "")),
  );
  assert.ok(data.markdown.includes(unrelated));
  assert.ok(data.markdown.includes(example));
  assert.equal(
    data.markdown.slice(data.sections[1].start, data.sections[1].end),
    "## 마지막 장\n\n끝\n",
  );
});

test("JSON transport preserves whitespace and code entities without HTML encoding", async () => {
  const body =
    "## 장\n\n공백 두 개:  끝\n\n```text\n&#x20; &gt; &amp; <br/>\n```\n";
  const data = await copyData(body);
  const serialized = serializeLlmCopyData(data);
  const transported = JSON.parse(serialized);
  assert.equal(transported.markdown, body);
  assert.equal(
    transported.markdown.split("```text\n")[0].includes("&#x20;"),
    false,
  );
});

test("sections preserve subheadings, table, list, quote, inline code and CRLF source", async () => {
  const first =
    "## 같은 제목\r\n\r\n### 하위 장\r\n\r\n`inline`과 **강조**\r\n\r\n| 열 | 값 |\r\n| --- | --- |\r\n| A | B |\r\n\r\n- 항목\r\n\r\n> 인용\r\n\r\n";
  const last = "## 같은 제목\r\n\r\n마지막 본문\r\n";
  const intro = "도입부\r\n\r\n";
  const data = await copyData(intro + first + last);
  assert.equal(data.markdown, intro + first + last);
  assert.deepEqual(
    data.sections.map((section) => section.id),
    ["같은-제목", "같은-제목-1"],
  );
  assert.equal(
    data.markdown.slice(data.sections[0].start, data.sections[0].end),
    first,
  );
  assert.equal(
    data.markdown.slice(data.sections[1].start, data.sections[1].end),
    last,
  );
  assert.equal(data.sections[1].end, data.markdown.length);
});

test("matches Astro smartypants headings while keeping original typography", async () => {
  const body = '## "반복"과 `next()`\n\n본문\n\n## 대기... -- 실행\n\n끝';
  const data = await copyData(body);
  assert.equal(data.markdown, body);
  assert.equal(data.sections.length, 2);
  assert.throws(
    () => createLlmCopyData(body, "실패", []),
    /H2 headings do not match/,
  );
  assert.throws(
    () =>
      createLlmCopyData("## 첫 장", "실패", [
        { depth: 2, slug: "other", text: "다른 장" },
      ]),
    /H2 headings do not match/,
  );
});

test("handles a page without H2 and safely embeds literal script end tags", async () => {
  const body = '소개\n\n```html\n</script><script>alert("x")</script>\n```\n';
  const data = await copyData(body, "제목 <테스트>");
  assert.equal(data.title, "제목 <테스트>");
  assert.equal(data.markdown, body);
  assert.deepEqual(data.sections, []);
  const serialized = serializeLlmCopyData(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});

test("all real Markdown posts map to Astro H2 slugs and retain diagram source fences", async () => {
  const root = new URL("../src/content/posts/", import.meta.url);
  const files = (await readdir(root, { recursive: true })).filter(
    (file) => file.endsWith(".md") && !file.split("/").at(-1).startsWith("_"),
  );
  assert.ok(files.length > 0);
  for (const file of files) {
    const { content, frontmatter } = parseFrontmatter(
      await readFile(new URL(file, root), "utf8"),
    );
    const data = await copyData(content, frontmatter.title);
    assert.ok(!data.markdown.includes("다이어그램 원본 보기 (Mermaid)"), file);
    assert.ok(!data.markdown.includes('class="dark:hidden"'), file);
    assert.ok(!data.markdown.includes('class="hidden dark:block"'), file);
    assert.ok(
      !/<div\b[^>]*class="not-prose[^"]*"[^>]*>\s*<\/div>/i.test(data.markdown),
      file,
    );
    const sourceFences =
      content.match(/```(?:text|mermaid)\r?\n[\s\S]*?\r?\n```/g) ?? [];
    for (const fence of sourceFences)
      assert.ok(data.markdown.includes(fence), file);
    if (data.sections.length)
      assert.equal(data.sections.at(-1).end, data.markdown.length, file);
    assert.equal(
      `# ${data.title}\n\n${data.markdown}`.startsWith(
        `# ${frontmatter.title}\n\n`,
      ),
      true,
    );
  }
});
