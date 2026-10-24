import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { HOST } from './site';

export const size = { width: 1200, height: 630 };

const h = (type, props, ...children) => ({ type, props: { ...props, children: children.flat() } });
const rail = { position: 'absolute', top: 0, bottom: 0, width: 0, borderLeft: '1px dashed rgba(255,255,255,.12)' };

export async function og({ eyebrow, title, footer }) {
  const sans = await readFile(join(process.cwd(), 'src/fonts/Aeonik-Regular.otf'));
  const tree = h('div', { style: { display: 'flex', width: '100%', height: '100%', background: '#000', color: '#fff', fontFamily: 'Aeonik', position: 'relative' } },
    h('div', { style: { ...rail, left: 0, width: 40, background: 'rgba(255,255,255,.04)', borderLeft: 'none', borderRight: '1px dashed rgba(255,255,255,.16)' } }),
    h('div', { style: { ...rail, right: 0, left: 'auto', width: 40, background: 'rgba(255,255,255,.04)', borderLeft: '1px dashed rgba(255,255,255,.16)' } }),
    h('div', { style: { ...rail, left: 120 } }),
    h('div', { style: { ...rail, left: 1080 } }),
    h('div', { style: { position: 'absolute', left: 120, top: 0, width: 1, height: 220, background: 'linear-gradient(transparent, #ff6a3d)' } }),
    h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '80px 120px 72px', width: '100%' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
        h('svg', { width: 50, height: 40, viewBox: '0 0 35 28', fill: '#fff' },
          h('path', { d: 'M4 4h5v20H4z' }),
          h('path', { d: 'M9 12.6 17.6 4H24L13 15z' }),
          h('path', { d: 'M12.6 14.2l3.2-3.1L24 24h-6.4z' }),
          h('path', { d: 'M27 21.5h6V24h-6z', fill: '#ff6a3d' }),
        ),
        h('div', { style: { fontSize: 24, color: 'rgba(255,255,255,.5)' } }, eyebrow),
      ),
      h('div', { style: { display: 'flex', fontSize: title.length > 48 ? 64 : 76, lineHeight: 1.08, letterSpacing: '-0.02em', maxWidth: 960, whiteSpace: 'pre-line' } }, title),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 24, color: 'rgba(255,255,255,.45)' } },
        h('div', { style: { display: 'flex', gap: 14 } },
          footer.map((f) => h('div', { style: { display: 'flex' } }, h('span', { style: { color: '#ff6a3d', marginRight: 10 } }, '›'), f)),
        ),
        h('div', { style: { display: 'flex', color: '#fff' } }, HOST),
      ),
    ),
  );
  const svg = await satori(tree, { ...size, fonts: [{ name: 'Aeonik', data: sans, weight: 400 }] });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size.width } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
