// SDK for Performance Service integration
// Re-export utilities for external workspaces

export { 
  preloadCritical, 
  preconnectDomains, 
  measureCoreWebVitals,
  useLazyImage,
  usePriorityImage,
} from '../shared/performance.ts'

// Re-export components
export { default as LazyComponent } from '../components/LazyComponent.vue'

/**
 * Performance SDK - unified interface
 * 
 * Usage:
 * import { performanceSDK } from './sdk'
 * 
 * // Preload critical resources
 * performanceSDK.preloadCritical(['/hero.webp'])
 * 
 * // Measure Core Web Vitals
 * performanceSDK.measureCoreWebVitals((metric) => {
 *   console.log(metric.name, metric.value)
 * })
 */
export const performanceSDK = {
  preloadCritical: async (urls) => {
    const { preloadCritical } = await import('../shared/performance.ts')
    preloadCritical(urls)
  },
  
  preconnectDomains: async (domains) => {
    const { preconnectDomains } = await import('../shared/performance.ts')
    preconnectDomains(domains)
  },
  
  measureCoreWebVitals: async (callback) => {
    const { measureCoreWebVitals } = await import('../shared/performance.ts')
    measureCoreWebVitals(callback)
  },
  
  optimizeImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('format', 'webp')
    
    const response = await fetch('/teo/performance-service/api/optimize/image', {
      method: 'POST',
      body: formData
    })
    return response.json()
  },
  
  getOptimizedImageUrl: (originalUrl, options = {}) => {
    const { width = 800, format = 'webp' } = options
    
    // If it's already a chatium CDN URL, convert directly
    if (originalUrl.includes('fs.chatium.ru')) {
      const base = originalUrl.replace(/\.[^.]+$/, '')
      return base + '.' + width + 'x.' + format
    }
    
    return originalUrl
  }
}
