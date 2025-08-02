import { createDefaultSVG } from '~/server/utils/svg-templates'

export default defineEventHandler(async (event) => {
  const svg = createDefaultSVG({
    title: 'Kerim',
    subtitle: 'Developer & Writer',
    author: 'kerim.im'
  })

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}) 