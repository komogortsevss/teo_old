// @shared

import { ref } from 'vue'
import { apiConfigGetRoute } from '../api/config/get'

export interface SiteConfig {
  company: {
    name: string
    description: string
    copyright: string
  }
  contacts: {
    phone: string
    phoneRaw: string
    email: string
  }
  socials: Array<{ name: string; icon: string; url: string }>
  nav: Array<{ label: string; href: string; key: string }>
  footerCategories: Array<{ label: string; href: string }>
  legal: Array<{ label: string; href: string }>
  addons: Array<{ id: string; name: string; priceAmount: number; icon: string }>
}

const config = ref<SiteConfig | null>(null)
const loading = ref(false)
const loaded = ref(false)

export function useConfig() {
  async function loadConfig() {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      config.value = await apiConfigGetRoute.run(ctx)
    } catch (e) {
      console.error('Failed to load config', e)
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  return { config, loading, loaded, loadConfig }
}