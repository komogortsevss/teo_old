// @shared
// Performance utilities for LCP optimization

/**
 * Preload critical resources for faster LCP
 * Usage: preloadCritical(['/hero.webp', '/font.woff2'])
 */
export function preloadCritical(urls: string[]): void {
  if (typeof document === 'undefined') return
  
  urls.forEach(url => {
    const ext = url.split('.').pop()?.toLowerCase()
    const as = ext === 'woff2' || ext === 'woff' ? 'font' : 
               ext === 'css' ? 'style' : 
               'image'
    
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = as
    if (as === 'font') {
      link.crossOrigin = 'anonymous'
    }
    if (as === 'image') {
      link.fetchPriority = 'high'
    }
    document.head.appendChild(link)
  })
}

/**
 * Preconnect to critical domains
 */
export function preconnectDomains(domains: string[]): void {
  if (typeof document === 'undefined') return
  
  domains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    if (domain.includes('fs.chatium.ru') || domain.includes('cdn')) {
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

/**
 * Measure Core Web Vitals
 */
export interface WebVitalMetric {
  name: 'LCP' | 'FCP' | 'CLS' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function measureCoreWebVitals(callback: (metric: WebVitalMetric) => void): void {
  if (typeof window === 'undefined') return

  // LCP
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
      callback({
        name: 'LCP',
        value: Math.round(lastEntry.startTime),
        rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
      })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] as unknown as string })
  }

  // FCP
  if ('PerformanceObserver' in window) {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as unknown as Array<{ name: string; startTime: number }>
      const fcp = entries.find(e => e.name === 'first-contentful-paint')
      if (fcp) {
        callback({
          name: 'FCP',
          value: Math.round(fcp.startTime),
          rating: fcp.startTime < 1800 ? 'good' : fcp.startTime < 3000 ? 'needs-improvement' : 'poor'
        })
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] as unknown as string })
  }

  // CLS
  let clsValue = 0
  if ('PerformanceObserver' in window) {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as Array<{ hadRecentInput: boolean; value: number }>) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] as unknown as string })
    
    window.addEventListener('beforeunload', () => {
      callback({
        name: 'CLS',
        value: Math.round(clsValue * 1000) / 1000,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
      })
    })
  }
}

/**
 * Lazy load images with native loading="lazy"
 */
export function useLazyImage(src: string): { src: string; loading: 'lazy' | 'eager' } {
  return {
    src,
    loading: 'lazy'
  }
}

/**
 * Priority loading for LCP images
 */
export function usePriorityImage(src: string): { 
  src: string; 
  loading: 'eager'; 
  fetchpriority: 'high';
  decoding: 'async' 
} {
  return {
    src,
    loading: 'eager',
    fetchpriority: 'high',
    decoding: 'async'
  }
}
