import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';
import { useDocsTheme } from '@/theme';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'tsx', title }: CodeBlockProps) {
  const { theme } = useDocsTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      borderRadius: 8,
      border: '1px solid var(--docs-border)',
      overflow: 'hidden',
      marginTop: 12,
      marginBottom: 16,
    }}>
      {title && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--docs-bg-tertiary)',
          borderBottom: '1px solid var(--docs-border)',
          fontSize: 13,
          color: 'var(--docs-text-secondary)',
          fontFamily: 'var(--docs-font-mono)',
        }}>
          {title}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'var(--docs-bg-tertiary)',
            border: '1px solid var(--docs-border)',
            borderRadius: 6,
            padding: '4px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--docs-text-secondary)',
            fontSize: 12,
            zIndex: 1,
          }}
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <Highlight
          theme={theme === 'dark' ? themes.nightOwl : themes.nightOwlLight}
          code={code.trim()}
          language={language}
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={{
              ...style,
              padding: '16px',
              margin: 0,
              overflow: 'auto',
              fontSize: 13,
              lineHeight: 1.7,
              fontFamily: 'var(--docs-font-mono)',
              background: 'var(--docs-bg-code)',
            }}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
