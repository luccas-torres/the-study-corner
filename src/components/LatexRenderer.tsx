import { useEffect, useRef } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
}

export function LatexRenderer({ content }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Process the content to render LaTeX
    let processedContent = content;

    // Handle display math ($$...$$)
    processedContent = processedContent.replace(
      /\$\$([^$]+)\$\$/g,
      (_, latex) => {
        try {
          return `<div class="katex-display">${katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
          })}</div>`;
        } catch (e) {
          return `<code class="text-destructive">${latex}</code>`;
        }
      }
    );

    // Handle inline math ($...$)
    processedContent = processedContent.replace(
      /\$([^$]+)\$/g,
      (_, latex) => {
        try {
          return katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
          });
        } catch (e) {
          return `<code class="text-destructive">${latex}</code>`;
        }
      }
    );

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return <div ref={containerRef} className="prose max-w-none" />;
}
