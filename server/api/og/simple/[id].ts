import { getPostData } from '~/server/utils/content'
import { createPostSVG } from '~/server/utils/svg-templates'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Post ID is required'
    })
  }

  try {
    const post = await getPostData(id)
    
    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    const wordCount = post.short_description ? post.short_description.split(' ').length : 0
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const svg = createPostSVG({
      title: post.title,
      description: post.short_description,
      readingTime,
      tags: post.tags
    })

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating SVG OG image:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate SVG OG image'
    })
  }
}) 