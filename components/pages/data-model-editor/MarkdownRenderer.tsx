import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { useMaxWidth: false, htmlLabels: true },
});

// Mermaid diagram rendering component
export const MermaidDiagram = ({ content }: { content: string }) => {
  const [svg, setSvg] = useState<string>('');
  
  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // Generate SVG with Mermaid
        const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, content);
        setSvg(svg);
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        setSvg(`<pre>Failed to render diagram:\n${content}</pre>`);
      }
    };
    
    renderDiagram();
  }, [content]);
  
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
};

// Markdown renderer with Mermaid support
export const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Handle code blocks specifically for mermaid
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (language === 'mermaid') {
            return <MermaidDiagram content={String(children).replace(/\n$/, '')} />;
          }

          return (
            <SyntaxHighlighter
              language={language}
              // @ts-ignore - Force TypeScript to ignore this specific type error
              style={xonokai}
              customStyle={{
                margin: '1rem 0',
                borderRadius: '0.375rem',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        }
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};

// Generate markdown content from model data
export const generateMarkdownContent = (
  modelName: string,
  mermaidCode: string,
  entities: Array<{ id: string; name: string; description: string }>,
  relationships: Array<{ id: string; source: string; target: string; cardinality: string; label: string }>,
  attributes: Record<string, Array<{ id: string; name: string; type: string }>>
): string => {
  let markdown = `# ${modelName}\n\n`;
  markdown += "```mermaid\n";
  markdown += mermaidCode;
  markdown += "\n```\n\n";
  
  // Add entity descriptions
  markdown += "## Entities\n\n";
  entities.forEach(entity => {
    markdown += `### ${entity.name}\n\n`;
    markdown += `${entity.description}\n\n`;
    
    const entityAttributes = attributes[entity.name];
    if (entityAttributes && entityAttributes.length > 0) {
      markdown += "| Attribute | Type |\n";
      markdown += "|-----------|------|\n";
      entityAttributes.forEach(attr => {
        markdown += `| ${attr.name} | ${attr.type} |\n`;
      });
      markdown += "\n";
    }
  });
  
  // Add relationships
  markdown += "## Relationships\n\n";
  markdown += "| Source | Relationship | Target | Cardinality |\n";
  markdown += "|--------|--------------|--------|-------------|\n";
  relationships.forEach(rel => {
    markdown += `| ${rel.source} | ${rel.label} | ${rel.target} | ${rel.cardinality} |\n`;
  });
  
  return markdown;
};

// Code syntax highlighting component
export const CodeHighlighter = ({ 
  code, 
  language = 'mermaid',
  height = '400px',
  onCopy
}: { 
  code: string;
  language?: string;
  height?: string;
  onCopy?: () => void;
}) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={xonokai}
      customStyle={{
        height: height,
        borderRadius: '0px',
        margin: '0px',
        padding: '1rem'
      }}
      codeTagProps={{
        style: {
          fontSize: '14px',
          fontFamily: 'monospace'
        }
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};