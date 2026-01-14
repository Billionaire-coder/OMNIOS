import { DesignerElement } from '@/types/designer';

export function compileToCode(elements: Record<string, DesignerElement>, rootId: string): string {
  function renderElement(id: string): string {
    const el = elements[id];
    if (!el) return '';

    const childrenCode = el.children?.map(childId => renderElement(childId)).join('\n') || '';

    // Convert React camelCase styles to CSS dash-case
    const styleString = Object.entries(el.styles || {})
      .map(([key, value]) => `${key.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${value};`)
      .join(' ');

    const tag = el.type === 'button' ? 'button' : el.type === 'text' ? 'div' : 'div';
    const content = el.content || '';

    return `
      <${tag} style={{ ${styleToString(el.styles)} }}>
        ${content}
        ${childrenCode}
      </${tag}>
    `;
  }

  return `
    "use client";
    import React from 'react';

    export default function ExportedProject() {
      return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden' }}>
          ${renderElement(rootId)}
        </div>
      );
    }
  `;
}

function styleToString(styles: any): string {
  // Utility to convert the styles object to a React inline style string
  return JSON.stringify(styles).replace(/"([^"]+)":/g, '$1:');
}
