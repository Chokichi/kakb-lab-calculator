import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders text with inline KaTeX math expressions
 * Math expressions are wrapped in $ signs: $H_2O$ or $10^{-5}$
 */
export function renderWithKatex(text: string): string {
  if (!text) return '';
  
  // Split by $ signs and process alternating segments
  const parts = text.split(/\$([^$]+)\$/g);
  
  return parts.map((part, index) => {
    // Even indices are regular text, odd indices are math
    if (index % 2 === 0) {
      return part;
    }
    
    try {
      return katex.renderToString(part, {
        throwOnError: false,
        displayMode: false,
        output: 'html'
      });
    } catch (e) {
      console.warn('KaTeX rendering error:', e);
      return `$${part}$`;
    }
  }).join('');
}

/**
 * React component for rendering text with KaTeX
 */
interface KatexTextProps {
  text: string;
  className?: string;
}

export function KatexText({ text, className }: KatexTextProps): JSX.Element {
  const html = renderWithKatex(text);
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
