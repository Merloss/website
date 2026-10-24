import { Marked } from 'marked';
import { createHighlighter } from 'shiki';

const THEME = 'github-dark-default';
const highlighter = createHighlighter({ themes: [THEME], langs: ['go', 'bash', 'hcl', 'js', 'json', 'yaml', 'sql'] });
const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export async function toHTML(md) {
  const hl = await highlighter;
  const code = ({ text, lang = '' }) => {
    const [, l, file] = lang.match(/^(\S*)\s*(?:\[(.+)\])?/);
    if (l === 'mermaid') return `<figure class="diagram"><pre class="mermaid">${esc(text)}</pre>${file ? `<figcaption>${esc(file)}</figcaption>` : ''}</figure>`;
    const html = hl.codeToHtml(text, { lang: hl.getLoadedLanguages().includes(l) ? l : 'text', theme: THEME });
    const label = file ? `<span class="code-file">${esc(file)}</span><span class="code-lang">${esc(l)}</span>` : `<span class="code-file">${esc(l || 'text')}</span>`;
    return `<figure class="code"><figcaption>${label}<button class="code-copy" type="button">Copy</button></figcaption>${html}</figure>`;
  };
  return new Marked({ renderer: { code } }).parse(md);
}
