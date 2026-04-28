// @shared
import { ref, watch } from 'vue'

function load(): string[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem('teo_favorites')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const favoriteIds = ref<string[]>(load())

watch(
  favoriteIds,
  (ids) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('teo_favorites', JSON.stringify(ids))
      }
    } catch {}
  },
  { deep: true }
)

export function useFavorites() {
  function toggle(id: string) {
    if (favoriteIds.value.includes(id)) {
      favoriteIds.value = favoriteIds.value.filter(i => i !== id)
    } else {
      favoriteIds.value = [...favoriteIds.value, id]
    }
  }

  function isFavorite(id: string) {
    return favoriteIds.value.includes(id)
  }

  return { favoriteIds, toggle, isFavorite }
}
