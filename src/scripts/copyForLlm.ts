import type { LlmCopyData } from "../utils/copyForLlm";

let cleanup: (() => void) | undefined;

function initLlmCopy() {
  cleanup?.();
  cleanup = undefined;
  const root = document.getElementById("main-content");
  const article = document.getElementById("article");
  const payload = document.getElementById("llm-copy-data");
  const template = document.querySelector<HTMLTemplateElement>(
    "#llm-section-copy-template",
  );
  const status = document.getElementById("llm-copy-status");
  if (!root || !article || !payload || !template || !status) return;

  const data: LlmCopyData = JSON.parse(payload.textContent ?? "{}");
  const controller = new AbortController();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const buttons: HTMLButtonElement[] = [];
  for (const section of data.sections) {
    const heading = document.getElementById(section.id);
    if (!heading || heading.tagName !== "H2" || !article.contains(heading))
      continue;
    const button = template.content
      .querySelector("button")!
      .cloneNode(true) as HTMLButtonElement;
    button.dataset.copySection = section.id;
    const headingLabel = heading.cloneNode(true) as HTMLElement;
    headingLabel
      .querySelectorAll(".heading-link")
      .forEach((link) => link.remove());
    const label = `이 장을 Markdown으로 복사: ${headingLabel.textContent?.trim()}`;
    button.setAttribute("aria-label", label);
    button.title = label;
    // The existing heading anchor remains a separate sibling.
    heading.appendChild(button);
    buttons.push(button);
  }

  root.addEventListener(
    "click",
    async (event) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLButtonElement>(
        "button[data-copy-page], button[data-copy-section]",
      );
      if (!button || !root.contains(button) || button.disabled) return;
      const label = button.querySelector<HTMLElement>("[data-copy-label]")!;
      const originalLabel = label.textContent;
      const section = data.sections.find(
        (section) => section.id === button.dataset.copySection,
      );
      if (!button.hasAttribute("data-copy-page") && !section) return;
      const markdown = section
        ? data.markdown.slice(section.start, section.end)
        : `# ${data.title}\n\n${data.markdown}`;

      button.disabled = true;
      status.textContent = "";
      let message: string;
      try {
        await navigator.clipboard.writeText(markdown);
        message = "Copied";
      } catch {
        message = "Copy failed";
      }
      if (controller.signal.aborted || !button.isConnected) return;
      label.textContent = message;
      status.textContent =
        message === "Copied"
          ? "Markdown을 복사했습니다."
          : "복사하지 못했습니다. 다시 시도해 주세요.";
      const timer = setTimeout(() => {
        label.textContent = originalLabel;
        button.disabled = false;
        status.textContent = "";
        timers.delete(timer);
      }, 1500);
      timers.add(timer);
    },
    { signal: controller.signal },
  );

  cleanup = () => {
    controller.abort();
    timers.forEach(clearTimeout);
    buttons.forEach((button) => button.remove());
    root
      .querySelectorAll<HTMLButtonElement>("button[data-copy-page]")
      .forEach((button) => {
        button.disabled = false;
        button.querySelector("[data-copy-label]")!.textContent = "Copy for LLM";
      });
    status.textContent = "";
  };
}

document.addEventListener("astro:page-load", initLlmCopy);
document.addEventListener("astro:before-swap", () => cleanup?.());
