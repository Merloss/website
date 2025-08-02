import { readFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import type { PostData } from '~/@types/templates'

export async function getPostData(id: string): Promise<PostData | null> {
  try {
    const filePath = join(process.cwd(), 'content', 'posts', `${id}.md`)
    const fileContent = readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)
    
    return {
      title: data.title,
      short_description: data.short_description,
      tags: data.tags,
      image: data.image,
      published_at: data.published_at
    } as PostData
  } catch (error) {
    console.error(`Error reading post ${id}:`, error)
    return null
  }
} 