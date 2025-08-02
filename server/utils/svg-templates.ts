import type { PostData, DefaultData } from '~/@types/templates'

// Helper function to calculate font size based on text length
function calculateFontSize(text: string, maxLength: number, baseSize: number, minSize: number): number {
  if (text.length <= maxLength) return baseSize
  const ratio = maxLength / text.length
  return Math.max(minSize, Math.floor(baseSize * ratio))
}

// Helper function to wrap text to maximum 2 lines
function wrapTextToLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
    // Stop at 3 lines maximum for description
    if (lines.length >= 3) break
  }
  
  if (currentLine && lines.length < 3) lines.push(currentLine)
  
  return lines
}

// Helper function to calculate spacing based on content length
function calculateSpacing(titleLines: string[], descriptionLines: string[]): { titleSpacing: number, descriptionSpacing: number, descriptionStart: number } {
  const totalContent = titleLines.length + descriptionLines.length
  
  if (totalContent <= 3) {
    return { titleSpacing: 50, descriptionSpacing: 35, descriptionStart: 160 } // Compact spacing
  } else if (totalContent <= 4) {
    return { titleSpacing: 60, descriptionSpacing: 40, descriptionStart: 200 } // Medium spacing
  } else {
    return { titleSpacing: 65, descriptionSpacing: 35, descriptionStart: 280 } // Full spacing
  }
}

function createSVG(content: string, width: number = 1200, height: number = 630): string {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient matching website theme -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
    </linearGradient>
    
    <!-- Accent gradient for highlights -->
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
    
    <!-- Text shadow filter -->
    <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.1)"/>
    </filter>
    
    <!-- Dotted pattern -->
    <pattern id="dotPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <circle cx="30" cy="30" r="2" fill="#9ca3af" opacity="0.4"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Dotted pattern overlay -->
  <rect width="${width}" height="${height}" fill="url(#dotPattern)"/>
  
  ${content}
  
  <!-- Subtle border -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
</svg>`
}

// Post-specific SVG template
export function createPostSVG(data: PostData): string {
  // Calculate dynamic font size for title (base 64px, min 32px, max 50 chars)
  const titleFontSize = calculateFontSize(data.title, 50, 64, 32)
  
  // Wrap title to 2 lines (max 35 chars per line)
  const titleLines = wrapTextToLines(data.title, 35)
  
  // Wrap description to 3 lines (max 60 chars per line)
  const descriptionLines = data.description ? wrapTextToLines(data.description, 60) : []
  
  // Calculate dynamic spacing
  const spacing = calculateSpacing(titleLines, descriptionLines)

  const tagElements = data.tags && data.tags.length > 0 
    ? data.tags.slice(0, 4).map((tag, index) => `
        <!-- Tag background with improved styling -->
        <rect x="${index * 160}" y="0" width="140" height="32" rx="6" fill="#e5e7eb" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
        <text x="${70 + index * 160}" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#374151" text-anchor="middle" font-weight="500">
          ${tag}
        </text>
      `).join('')
    : ''

  const content = `
    <!-- Content container -->
    <g transform="translate(80, 60)">
      <!-- Title with website styling -->
      ${titleLines.map((line, index) => `
        <text x="0" y="${80 + (index * spacing.titleSpacing)}" font-family="system-ui, -apple-system, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#111827" filter="url(#textShadow)">
          ${line}
        </text>
      `).join('')}
      
      <!-- Description -->
      ${descriptionLines.map((line, index) => `
        <text x="0" y="${spacing.descriptionStart + (index * spacing.descriptionSpacing)}" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#6b7280" filter="url(#textShadow)">
          ${line}
        </text>
      `).join('')}
      
      <!-- Reading time -->
      ${data.readingTime ? `
        <text x="0" y="${spacing.descriptionStart + (descriptionLines.length * spacing.descriptionSpacing) + 35}" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280" filter="url(#textShadow)">
          📖 ${data.readingTime} min read
        </text>
      ` : ''}
    </g>
    
    <!-- Tags positioned at bottom left (replacing author section) -->
    ${data.tags && data.tags.length > 0 ? `
      <g transform="translate(80, 520)">
        ${tagElements}
      </g>
    ` : ''}
  `

  return createSVG(content)
}

export function createDefaultSVG(data: DefaultData): string {
  // Wrap title to 2 lines (max 15 chars per line for centered text)
  const titleLines = wrapTextToLines(data.title, 15)
  
  // Wrap subtitle to 2 lines (max 20 chars per line)
  const subtitleLines = wrapTextToLines(data.subtitle, 20)
  
  const truncatedAuthor = data.author ? wrapTextToLines(data.author, 20)[0] : '' // Author is single line

  const content = `
    <!-- Content container -->
    <g transform="translate(600, 315)">
      <!-- Title with website styling -->
      ${titleLines.map((line, index) => `
        <text x="0" y="${-80 + (index * 80)}" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="#111827" text-anchor="middle" filter="url(#textShadow)">
          ${line}
        </text>
      `).join('')}
      
      <!-- Description -->
      ${subtitleLines.map((line, index) => `
        <text x="0" y="${-20 + (index * 40)}" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="#6b7280" text-anchor="middle" filter="url(#textShadow)">
          ${line}
        </text>
      `).join('')}
      
      <!-- Author section with website styling -->
      <g transform="translate(0, 40)">
        <!-- Avatar circle -->
        <circle cx="0" cy="0" r="24" fill="url(#accentGradient)"/>
        <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">
          K
        </text>
        
        <!-- Author info -->
        <text x="40" y="6" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#111827">
          ${truncatedAuthor}
        </text>
      </g>
    </g>
  `

  return createSVG(content)
} 