// @shared

/**
 * Image optimization utilities
 * Note: Chatium CDN does NOT support ?format=webp/avif parameters.
 * All format conversion functions have been removed.
 * Use standard thumbnail URLs with srcset for responsive images.
 */

/**
 * Get clean hash (remove file extension)
 */
export function getCleanHash(hash: string): string {
  if (!hash) return ''
  return hash.replace(/\.[^/.]+$/, '')
}

/**
 * Generate thumbnail URL for given hash and width
 */
export function getThumbnailUrlByWidth(hash: string, width: number, height?: number): string {
  if (!hash) return ''
  const cleanHash = getCleanHash(hash)
  if (height) {
    return `https://fs.chatium.ru/thumbnail/${cleanHash}/s/${width}x${height}`
  }
  return `https://fs.chatium.ru/thumbnail/${cleanHash}/s/${width}x`
}

/**
 * Generate srcset string for multiple widths
 */
export function generateSrcSet(hash: string, widths: number[], height?: number): string {
  if (!hash) return ''
  const cleanHash = getCleanHash(hash)
  return widths
    .map(w => {
      const h = height ? Math.round(w * height / widths[0]) : ''
      const size = h ? `${w}x${h}` : `${w}x`
      return `https://fs.chatium.ru/thumbnail/${cleanHash}/s/${size} ${w}w`
    })
    .join(', ')
}
