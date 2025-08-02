# Dynamic OG Images

This project includes a dynamic Open Graph image generation system that creates custom images for social media sharing based on post content.

## Features

- **Dynamic Post Images**: Automatically generated OG images for each blog post
- **Default Image**: Fallback image for pages without specific content
- **SVG Format**: Vector-based images for crisp display at any size
- **Website Theme**: Matches the site's design aesthetic
- **Reading Time**: Estimated reading time for posts
- **Tags Display**: Post tags positioned in bottom right

## API Endpoints

### Post-Specific Images

```
GET /api/og/simple/[id]
```

Generates an OG image for a specific post using its front-matter data.

**Parameters:**

- `id`: Post filename (without .md extension)

**Example:**

```
GET /api/og/simple/yeni-bir-baslangic
```

### Default Image

```
GET /api/og/simple
```

Generates a default OG image for pages without specific content.

## Usage

### In Vue Components

Update your `useSeoMeta` calls to use the dynamic endpoints:

```vue
<script setup>
const { id } = useRoute().params;

useSeoMeta({
  title: () => page.value?.title || "Blog Post",
  description: () =>
    page.value?.short_description || "An interesting blog post.",
  ogImage: () => {
    const baseUrl = useRequestURL().origin;
    return `${baseUrl}/api/og/simple/${id}`;
  },
  twitterImage: () => {
    const baseUrl = useRequestURL().origin;
    return `${baseUrl}/api/og/simple/${id}`;
  },
});
</script>
```

### For Default Pages

```vue
<script setup>
useSeoMeta({
  title: "About Kerim Kara",
  description:
    "Learn more about Kerim Kara, a software developer based in Turkiye.",
  ogImage: () => {
    const baseUrl = useRequestURL().origin;
    return `${baseUrl}/api/og/simple`;
  },
  twitterImage: () => {
    const baseUrl = useRequestURL().origin;
    return `${baseUrl}/api/og/simple`;
  },
});
</script>
```

## Visual Design

### Post Images (SVG)

- **Design Theme**: Matches the site's light mode design
- **Background**: Light gray gradient (`#e5e7eb` to `#f3f4f6`)
- **Title**: 64px, bold, dark gray (`#111827`)
- **Description**: 32px, medium gray (`#6b7280`)
- **Reading Time**: 📖 X min read (estimated)
- **Tags**: Bottom right corner, website card style (`#d1d5db` background, 4px radius, 12px font)
- **Font**: system-ui, -apple-system, sans-serif
- **Text Shadow**: Subtle drop shadow for depth
- **Layout**: Optimized spacing and positioning

### Default Image (SVG)

- **Design Theme**: Matches the site's light mode design
- **Background**: Light gray gradient (`#e5e7eb` to `#f3f4f6`)
- **Title**: 72px, bold, dark gray (`#111827`)
- **Subtitle**: 36px, medium gray (`#6b7280`)
- **Author Info**: Blue gradient avatar, dark text
- **Font**: system-ui, -apple-system, sans-serif
- **Text Shadow**: Subtle drop shadow for depth
- **Layout**: Centered content with author info

## Technical Details

### File Structure

```
server/
├── api/
│   └── og/
│       └── simple/
│           ├── [id].ts    # Post-specific OG images
│           └── index.ts   # Default OG image
└── utils/
    ├── content.ts         # Content reading utilities
    └── svg-templates.ts  # HTML template utilities
@types/
└── templates.ts          # Type definitions
```

### Content Reading

The system reads post data directly from Markdown files using:

- **File System**: Direct file reading with `fs`
- **Gray Matter**: Front-matter parsing with `gray-matter`
- **Error Handling**: Graceful fallbacks for missing files

### SVG Generation

- **Format**: SVG for vector-based rendering
- **Dimensions**: 1200x630 (standard OG size)
- **Styling**: Inline CSS matching Tailwind aesthetic
- **Performance**: Lightweight, fast generation
- **Caching**: Long-term cache headers
- **Developer Experience**: TypeScript builder utility with intellisense support

### Reading Time Calculation

- **Formula**: Word count ÷ 200 words per minute
- **Minimum**: 1 minute guaranteed
- **Source**: Post short_description field
- **Display**: 📖 X min read

## Testing

### Manual Testing

1. **Start the development server:**

   ```bash
   yarn dev
   ```

2. **Test post-specific images:**

   ```bash
   curl "http://localhost:3000/api/og/simple/yeni-bir-baslangic" -o test-post.svg
   ```

3. **Test default image:**

   ```bash
   curl "http://localhost:3000/api/og/simple" -o test-default.svg
   ```

4. **Check HTTP headers:**
   ```bash
   curl -I "http://localhost:3000/api/og/simple/yeni-bir-baslangic"
   ```

### Expected Results

- **Status Code**: 200 OK
- **Content-Type**: image/svg+xml
- **Cache-Control**: public, max-age=31536000, immutable
- **File Size**: ~2-5KB (SVG format)

### Browser Testing

1. Open any post page
2. Use browser dev tools to inspect meta tags
3. Verify `og:image` and `twitter:image` URLs
4. Test social media preview tools

## Troubleshooting

### Common Issues

1. **Blank Images**: Check if post file exists and has valid front-matter
2. **404 Errors**: Verify post ID matches filename (without .md)
3. **500 Errors**: Check server logs for file reading issues
4. **Caching Issues**: Clear browser cache or add cache-busting parameters

### Debug Steps

1. **Check file existence:**

   ```bash
   ls content/posts/[post-id].md
   ```

2. **Verify front-matter:**

   ```bash
   head -10 content/posts/[post-id].md
   ```

3. **Test API directly:**
   ```bash
   curl -v "http://localhost:3000/api/og/simple/[post-id]"
   ```

## Performance

- **Generation Time**: ~10-50ms per image
- **File Size**: 2-5KB per SVG
- **Memory Usage**: Minimal (no image processing)
- **Caching**: Long-term browser and CDN caching
- **Scalability**: Stateless, can be cached at edge

## Developer Experience

### SVG Template Utility

The project includes a TypeScript-based SVG template utility (`server/utils/svg-templates.ts`) that provides:

- **Type Safety**: Full TypeScript support with interfaces and types
- **Intellisense**: Auto-completion for SVG elements and attributes
- **Reusable Components**: Pre-built functions for common patterns
- **Clean API**: HTML template approach with TypeScript support
- **Maintainable Code**: Structured and organized SVG generation

### Usage Examples

```typescript
// Post-specific image
const svg = createPostSVG({
  width: 1200,
  height: 630,
  title: "My Post Title",
  description: "Post description",
  readingTime: 3,
  tags: ["tag1", "tag2"],
});

// Default image
const svg = createDefaultSVG({
  width: 1200,
  height: 630,
  title: "Kerim",
  subtitle: "Developer & Writer",
  author: "kerim.im",
});
```

## Future Enhancements

- **Dark Mode Support**: Dynamic theme switching
- **Custom Templates**: Multiple design options
- **Image Optimization**: WebP conversion for better compression
- **Analytics**: Track image generation and usage
- **A/B Testing**: Different designs for engagement optimization
