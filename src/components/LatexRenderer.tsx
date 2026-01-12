import { useEffect, useRef } from 'react';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
}

export function LatexRenderer({ content }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // 1. Injeta o HTML bruto (texto do artigo)
      containerRef.current.innerHTML = content;

      // 2. Procura padrões LaTeX e renderiza
      renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true }, // Bloco (centro)
          { left: '$', right: '$', display: false },  // Inline (no texto)
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false, // Não quebra a página se houver erro na fórmula
        errorColor: '#cc0000',
      });
    }
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className="latex-content [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden"
    />
  );
}