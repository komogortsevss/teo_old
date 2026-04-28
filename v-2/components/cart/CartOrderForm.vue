<template>
  <div class="form-grid">
    <!-- Блок: Когда доставить -->
    <div class="form-block">
      <div class="form-block-title">Когда доставить</div>
      
      <!-- Дата -->
      <div class="form-field full">
        <div class="quick-date-btns">
          <button 
            type="button" 
            @click="setDate(0)" 
            class="quick-btn" 
            :class="{ active: isDateToday, error: v.deliveryDate, disabled: !hasTodaySlots }"
            :disabled="!hasTodaySlots"
            :title="!hasTodaySlots ? 'На сегодня нет доступных периодов доставки' : ''"
          >Сегодня</button>
          <button type="button" @click="setDate(1)" class="quick-btn" :class="{ active: isDateTomorrow, error: v.deliveryDate }">Завтра</button>
          <button type="button" @click="setDate(2)" class="quick-btn" :class="{ active: isDateDayAfterTomorrow, error: v.deliveryDate }">Послезавтра</button>
        </div>
        <span v-if="v.deliveryDate" class="form-error" style="margin-top: 6px;">Выберите дату доставки</span>
        
      </div>

      <!-- Время -->
      <div class="form-field full">
        <div class="time-dropdown-wrapper">
          <button 
            type="button" 
            class="time-dropdown-trigger" 
            :class="{ error: v.deliveryTime, active: isTimeDropdownOpen, disabled: !form.deliveryDate }" 
            @click="form.deliveryDate && toggleTimeDropdown()"
            :disabled="!form.deliveryDate"
            :title="!form.deliveryDate ? 'Сначала выберите дату доставки' : ''"
          >
            <span v-if="form.deliveryTime" class="time-dropdown-value">{{ selectedTimeLabel }}</span>
            <span v-else class="time-dropdown-placeholder">{{ form.deliveryDate ? 'Выберите время' : 'Сначала выберите дату' }}</span>
            <i class="fa-solid fa-chevron-down" :class="{ rotated: isTimeDropdownOpen }"></i>
          </button>
          <Transition name="dropdown">
            <div v-if="isTimeDropdownOpen" class="time-slots-dropdown">
              <button
                v-for="slot in timeSlots"
                :key="slot.value"
                type="button"
                class="time-slot"
                :class="[form.deliveryTime === slot.value ? 'selected' : '', 'period-' + slot.period]"
                @click="selectTime(slot.value)"
              >
                <span class="time-slot-label">{{ slot.label }}</span>
              </button>
            </div>
          </Transition>
        </div>
        <span v-if="v.deliveryTime" class="form-error">Выберите время доставки</span>
      </div>
    </div>

    <!-- Блок: Кто заказывает -->
    <div class="form-block">
      <div class="form-block-title">Заказчик</div>
      
      <div class="form-row two-col">
        <!-- Имя заказчика -->
        <div class="form-field">
          <input v-model="form.buyerName" class="form-input" :class="{ error: v.buyerName }" placeholder="Имя заказчика" type="text" @input="v.buyerName = false" @focus="onFieldFocus" />
          <span v-if="v.buyerName" class="form-error">Введите имя</span>
        </div>

        <!-- Телефон заказчика -->
        <div class="form-field">
          <input v-model="form.buyerPhone" class="form-input" :class="{ error: v.buyerPhone }" placeholder="+7 (___) ___-__-__" type="tel" @input="formatPhone($event, 'buyerPhone')" @focus="onPhoneFocus($event, 'buyerPhone')" />
          <span v-if="v.buyerPhone" class="form-error">Введите номер телефона</span>
        </div>
      </div>
    </div>

    <!-- Блок: Получатель -->
    <div class="form-block" style="gap: 8px;">
      <label class="toggle-label">
        <div class="toggle-wrap">
          <input type="checkbox" v-model="form.forOther" class="toggle-input" />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </div>
        Букет для другого человека
      </label>

      <template v-if="form.forOther">
        <div class="form-field full">
          <input v-model="form.recipientName" class="form-input" :class="{ error: v.recipientName }" placeholder="Имя получателя" type="text" @input="v.recipientName = false" @focus="onFieldFocus" />
          <span v-if="v.recipientName" class="form-error">Введите имя получателя</span>
        </div>

        <div class="form-field full">
          <input v-model="form.recipientPhone" class="form-input" :class="{ error: v.recipientPhone }" placeholder="Номер получателя" type="tel" @input="formatPhone($event, 'recipientPhone')" @focus="onPhoneFocus($event, 'recipientPhone')" />
          <span v-if="v.recipientPhone" class="form-error">Введите номер получателя</span>
        </div>

        <div class="form-field full">
          <label class="toggle-label">
            <div class="toggle-wrap">
              <input type="checkbox" v-model="form.clarifyAddress" class="toggle-input" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </div>
            Уточнить адрес у получателя
          </label>
        </div>
      </template>
    </div>

    <!-- Блок: Куда доставить -->
    <div class="form-block address-block" v-if="!form.clarifyAddress">
      <div class="form-block-header">
        <div class="form-block-title">Куда доставить</div>
      </div>
      
      
      <!-- Saved address selector -->
      <div v-if="hasSavedAddress" class="form-field full" style="margin-bottom: 4px;">
        <div class="saved-addr-selector">
          <!-- Дом -->
          <button
            v-if="hasHomeAddress"
            type="button"
            class="saved-addr-btn"
            :class="{ active: useSavedAddress && selectedAddressType === 'home' }"
            @click="applySavedAddress('home')"
          >
            <i class="fa-solid fa-house"></i>
            <span>Дом</span>
            <span class="saved-addr-preview">{{ homeAddress?.street }}{{ homeAddress?.house ? ', д. ' + homeAddress.house : '' }}</span>
          </button>
          <!-- Работа -->
          <button
            v-if="hasWorkAddress"
            type="button"
            class="saved-addr-btn"
            :class="{ active: useSavedAddress && selectedAddressType === 'work' }"
            @click="applySavedAddress('work')"
          >
            <i class="fa-solid fa-briefcase"></i>
            <span>Работа</span>
            <span class="saved-addr-preview">{{ workAddress?.street }}{{ workAddress?.house ? ', д. ' + workAddress.house : '' }}</span>
          </button>
          <!-- Другой адрес -->
          <button
            type="button"
            class="saved-addr-btn"
            :class="{ active: !useSavedAddress }"
            @click="clearSavedAddress"
          >
            <i class="fa-solid fa-map-pin"></i>
            <span>Другой адрес</span>
          </button>
        </div>
      </div>

      <div class="form-field full address-field-wrapper" style="margin-top: 16px;">
        <div class="suggest-wrapper">
          <input
            ref="streetInputRef"
            v-model="form.street"
            class="form-input with-clear"
            :class="{ error: v.street }"
            placeholder="Улица и номер дома"
            type="text"
            autocomplete="off"
            @input="onStreetInput"
            @focus="onStreetFocus"
            @blur="hideSuggestionsDelayed"
            @keydown.down.prevent="navigateSuggestion(1)"
            @keydown.up.prevent="navigateSuggestion(-1)"
            @keydown.enter.prevent="selectHighlightedSuggestion"
            @keydown.escape="showSuggestions = false"
          />
          <button
            v-if="form.street"
            type="button"
            class="input-clear-btn cross-btn"
            @click="clearStreet"
            title="Очистить"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
              <button
                v-for="(s, idx) in suggestions"
                :key="idx"
                type="button"
                class="suggestion-item"
                :class="{ highlighted: idx === highlightedIndex }"
                @mousedown.prevent="selectSuggestion(s)"
                @touchstart.prevent="selectSuggestion(s)"
              >
                <i class="fa-solid fa-location-dot"></i>
                <div class="suggestion-text">
                  <span class="suggestion-title">{{ s.title }}</span>
                  <span v-if="s.subtitle" class="suggestion-subtitle">{{ s.subtitle }}</span>
                </div>
              </button>
            </div>
          </Transition>
        </div>
        <span v-if="v.street" class="form-error">Введите улицу</span>
      </div>

      <!-- MKAD warning - после поля с улицей -->
      <Transition name="mkad-banner">
        <div v-if="outsideMkad" class="mkad-warning">
          <div class="mkad-warning-icon">
            <i class="fa-solid fa-location-crosshairs"></i>
          </div>
          <div class="mkad-warning-content">
            <div class="mkad-warning-title">К сожалению, пока доставка только в пределах МКАД</div>
            <div class="mkad-warning-text">Выберите другой адрес в пределах Москвы</div>
          </div>
        </div>
      </Transition>

      <div class="address-row" style="margin-top: 16px;">
        <div class="form-field"><input v-model="form.apartment" class="form-input" placeholder="Квартира" type="tel" inputmode="numeric" pattern="[0-9]*" @input="useSavedAddress = false" @focus="onFieldFocus" /></div>
        <div class="form-field"><input v-model="form.entrance" class="form-input" placeholder="Подъезд" type="tel" inputmode="numeric" pattern="[0-9]*" @input="useSavedAddress = false" @focus="onFieldFocus" /></div>
        <div class="form-field"><input v-model="form.floor" class="form-input" placeholder="Этаж" type="tel" inputmode="numeric" pattern="[0-9]*" @input="useSavedAddress = false" @focus="onFieldFocus" /></div>
        <div class="form-field"><input v-model="form.intercom" class="form-input" placeholder="Домофон" type="tel" inputmode="numeric" pattern="[0-9]*" @input="useSavedAddress = false" @focus="onFieldFocus" /></div>
      </div>

      

      <!-- Сохранить адрес -->
      <div v-if="isAuthenticated && !useSavedAddress && form.street" class="form-field full save-address-block">
        <label class="toggle-label">
          <div class="toggle-wrap">
            <input type="checkbox" v-model="form.saveAddress" class="toggle-input" />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </div>
          <span class="save-address-text">Сохранить этот адрес</span>
        </label>
        
        <div v-if="form.saveAddress" class="address-type-selector">
          <button 
            type="button" 
            class="address-type-btn" 
            :class="{ active: form.addressType === 'home' }"
            @click="form.addressType = 'home'"
          >
            <i class="fa-solid fa-house"></i>
            <span>Дом</span>
          </button>
          <button 
            type="button" 
            class="address-type-btn" 
            :class="{ active: form.addressType === 'work' }"
            @click="form.addressType = 'work'"
          >
            <i class="fa-solid fa-briefcase"></i>
            <span>Работа</span>
          </button>
        </div>
      </div>

      <!-- Yandex Map -->
      <div v-if="selectedCoords || mapLoading" class="form-field full" style="margin-top: 16px;">
        <div class="map-container" :class="{ loading: mapLoading }" ref="mapContainerRef">
          <div v-if="mapLoading" class="map-skeleton"></div>
        </div>
      </div>
    </div>

    <!-- Записка -->
    <div class="form-field full">
      <label class="form-label">Записка к букету</label>
      <textarea v-model="form.noteText" class="form-textarea" placeholder="Ваше пожелание или поздравление..." rows="3" @focus="onFieldFocus"></textarea>
    </div>

    <!-- Комментарий -->
    <div class="form-field full">
      <label class="form-label">Комментарий к заказу</label>
      <textarea v-model="form.comment" class="form-textarea" placeholder="Дополнительные пожелания к заказу" rows="2" @focus="onFieldFocus"></textarea>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, toRef, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTimeSlots } from '../../shared/useTimeSlots'
import { apiOrdersCreateRoute } from '../../api/orders/create'
import { apiProfileGetRoute } from '../../api/profile/get'
import { apiProfileUpdateRoute } from '../../api/profile/update'
import { MKAD_POLYGON, isPointInsideMkad } from '../../shared/mkadPolygon'

const props = defineProps({
  activeItems: { type: Array, required: true },
  addons: { type: Array, required: true },
  allAddonsCache: { type: Array, default: () => [] },
  totalPrice: { type: Number, required: true },
  isAuthenticated: { type: Boolean, default: false },
})

const emit = defineEmits(['submitted', 'error', 'authRequired'])

const STORAGE_KEY = 'teo-order-form'

function getSavedForm() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {}
  return null
}

function saveForm() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      buyerName: form.buyerName,
      buyerPhone: form.buyerPhone,
      forOther: form.forOther,
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      clarifyAddress: form.clarifyAddress,
      street: form.street,
      apartment: form.apartment,
      entrance: form.entrance,
      floor: form.floor,
      intercom: form.intercom,
      hasNote: form.hasNote,
      noteText: form.noteText,
      comment: form.comment,
    }))
  } catch (e) {}
}

function clearSavedForm() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {}
}

const savedForm = getSavedForm()

const form = reactive({
  deliveryDate: savedForm?.deliveryDate || '',
  deliveryTime: savedForm?.deliveryTime || '',
  buyerName: savedForm?.buyerName || '',
  buyerPhone: savedForm?.buyerPhone || '',
  forOther: savedForm?.forOther || false,
  recipientName: savedForm?.recipientName || '',
  recipientPhone: savedForm?.recipientPhone || '',
  clarifyAddress: savedForm?.clarifyAddress || false,
  street: savedForm?.street || '',
  apartment: savedForm?.apartment || '',
  entrance: savedForm?.entrance || '',
  floor: savedForm?.floor || '',
  intercom: savedForm?.intercom || '',
  hasNote: savedForm?.hasNote || false,
  noteText: savedForm?.noteText || '',
  comment: savedForm?.comment || '',
  saveAddress: false,
  addressType: 'home',
})

const { availableTimeSlots: timeSlots } = useTimeSlots(toRef(form, 'deliveryDate'), toRef(form, 'deliveryTime'))

const v = reactive({
  deliveryDate: false,
  deliveryTime: false,
  buyerName: false,
  buyerPhone: false,
  recipientName: false,
  recipientPhone: false,
  street: false,
})

const isTimeDropdownOpen = ref(false)
const homeAddress = ref(null)
const workAddress = ref(null)
const useSavedAddress = ref(false)
const selectedAddressType = ref('home') // 'home' или 'work'

// Suggest state
const suggestions = ref([])
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)
const streetInputRef = ref(null)
const suggestDebounce = ref(null)
const isStreetFocused = ref(false)
const addressSelected = ref(false)

// Map state
const selectedCoords = ref(null)
const outsideMkad = ref(false)
const mapContainerRef = ref(null)
let mapInstance = null
let markerPlacemark = null
let mkadPolygonObj = null
let ymapsV2Loaded = false
let pendingCoords = null
let mapContainerEl = null
const mapLoading = ref(false)
let ymapsScriptLoading = false
let ymapsScriptLoaded = false

// Dynamic Yandex Maps script loader
function loadYandexMapsScript() {
  if (ymapsScriptLoaded) return Promise.resolve()
  if (ymapsScriptLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (ymapsScriptLoaded) {
          clearInterval(check)
          resolve()
        }
      }, 100)
    })
  }
  
  ymapsScriptLoading = true
  return new Promise((resolve, reject) => {
    if (typeof window.ymaps !== 'undefined') {
      ymapsScriptLoaded = true
      ymapsScriptLoading = false
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=3e8e6276-8471-4559-b3b4-8c9947308b8c&lang=ru_RU'
    script.type = 'text/javascript'
    script.async = true
    
    script.onload = () => {
      if (typeof window.ymaps !== 'undefined') {
        window.ymapsV2Ready = new Promise(function(resolveYmaps) {
          window.ymaps.ready(resolveYmaps)
        })
      }
      ymapsScriptLoaded = true
      ymapsScriptLoading = false
      resolve()
    }
    
    script.onerror = () => {
      ymapsScriptLoading = false
      reject(new Error('Failed to load Yandex Maps'))
    }
    
    document.head.appendChild(script)
  })
}

// Auth state for unauthenticated users
const needsAuth = ref(false)

const hasSavedAddress = computed(() => {
  return (homeAddress.value && homeAddress.value.street) || (workAddress.value && workAddress.value.street)
})

const hasHomeAddress = computed(() => homeAddress.value && homeAddress.value.street)
const hasWorkAddress = computed(() => workAddress.value && workAddress.value.street)

const hasAnyAddressField = computed(() => {
  return !!(form.street || form.apartment || form.entrance || form.floor || form.intercom)
})

const hasAnyFormField = computed(() => {
  return !!(
    form.deliveryDate ||
    form.deliveryTime ||
    form.buyerName ||
    form.buyerPhone ||
    form.recipientName ||
    form.recipientPhone ||
    form.street ||
    form.apartment ||
    form.entrance ||
    form.floor ||
    form.intercom ||
    form.noteText ||
    form.comment ||
    form.forOther ||
    form.clarifyAddress
  )
})

const savedAddressPreview = computed(() => {
  const addr = selectedAddressType.value === 'work' ? workAddress.value : homeAddress.value
  if (!addr || !addr.street) return ''
  let parts = [addr.street]
  if (addr.house) parts.push('д. ' + addr.house)
  if (addr.apartment) parts.push('кв. ' + addr.apartment)
  return parts.join(', ')
})

onMounted(async () => {
  // Если есть сохранённые данные и адрес — восстанавливаем useSavedAddress
  if (savedForm?.street) {
    useSavedAddress.value = true
  }
  
  try {
    const res = await apiProfileGetRoute.run(ctx)
    if (res.user) {
      // Заполняем имя и телефон из профиля
      if (res.user.firstName && !form.buyerName.trim()) {
        form.buyerName = res.user.firstName
      }
      // Телефон всегда берём из профиля, если он есть
      if (res.user.phone) {
        form.buyerPhone = formatRawPhone(res.user.phone)
      }
    }
    if (res.profile) {
      // Домашний адрес
      if (res.profile.street) {
        homeAddress.value = {
          street: res.profile.street,
          house: res.profile.house,
          apartment: res.profile.apartment,
          entrance: res.profile.entrance,
          floor: res.profile.floor,
          intercom: res.profile.intercom,
        }
      }
      // Рабочий адрес
      if (res.profile.workStreet) {
        workAddress.value = {
          street: res.profile.workStreet,
          house: res.profile.workHouse,
          apartment: res.profile.workApartment,
          entrance: res.profile.workEntrance,
          floor: res.profile.workFloor,
          intercom: res.profile.workIntercom,
        }
      }
    }
  } catch (e) {}
  
  // Запускаем геокодирование если есть сохранённый адрес
  if (form.street && !form.clarifyAddress) {
    geocodeFullAddress()
  }
})

// Form is now saved automatically via watchers

function applySavedAddress(type = 'home') {
  selectedAddressType.value = type
  const addr = type === 'work' ? workAddress.value : homeAddress.value
  if (!addr || !addr.street) return
  useSavedAddress.value = true
  form.street = addr.street || ''
  form.apartment = addr.apartment || ''
  form.entrance = addr.entrance || ''
  form.floor = addr.floor || ''
  form.intercom = addr.intercom || ''
  v.street = false
  geocodeFullAddress()
}

function clearSavedAddress() {
  useSavedAddress.value = false
  form.street = ''
  form.apartment = ''
  form.entrance = ''
  form.floor = ''
  form.intercom = ''
  selectedCoords.value = null
  outsideMkad.value = false
  pendingCoords = null
}

function clearStreet() {
  addressSelected.value = false
  form.street = ''
  form.apartment = ''
  form.entrance = ''
  form.floor = ''
  form.intercom = ''
  suggestions.value = []
  showSuggestions.value = false
  selectedCoords.value = null
  outsideMkad.value = false
  useSavedAddress.value = false
  v.street = false
  nextTick(() => {
    streetInputRef.value?.focus()
  })
}

// --- Yandex Suggest ---
async function fetchSuggestions(query) {
  if (!query || query.length < 3) {
    suggestions.value = []
    return
  }
  try {
    // Use Yandex Suggest HTTP API
    const resp = await fetch(`https://suggest-maps.yandex.ru/v1/suggest?apikey=dd895209-80bc-455d-97c8-686d75a4a037&text=Москва, ${encodeURIComponent(query)}&types=house,street&results=6&lang=ru_RU`)
    const data = await resp.json()
    const results = data?.results || []
    suggestions.value = results.map(item => ({
      title: item.title?.text || '',
      subtitle: item.subtitle?.text || '',
      fullText: (item.title?.text || '') + (item.subtitle?.text ? ', ' + item.subtitle?.text : ''),
    }))
  } catch (e) {
    suggestions.value = []
  }
}

function onStreetInput(event) {
  if (!streetInputRef.value || event?.target !== streetInputRef.value) return
  if (document.activeElement !== streetInputRef.value) return
  // Если адрес уже выбран из подсказки — игнорируем input (Android может повторно тригерить)
  if (addressSelected.value) {
    addressSelected.value = false
    return
  }
  v.street = false
  useSavedAddress.value = false
  highlightedIndex.value = -1
  const value = event?.target?.value ?? form.street
  if (suggestDebounce.value) clearTimeout(suggestDebounce.value)
  suggestDebounce.value = setTimeout(() => {
    fetchSuggestions(value)
    showSuggestions.value = true
  }, 300)
}

function hideSuggestionsDelayed() {
  isStreetFocused.value = false
  setTimeout(() => { showSuggestions.value = false }, 200)
}

function onStreetFocus(e) {
  isStreetFocused.value = true
  // Не показываем подсказки повторно если адрес только что выбран
  if (!addressSelected.value) {
    showSuggestions.value = suggestions.value.length > 0
  }
  onFieldFocus(e)
}

function onFieldFocus(e) {
  // Автоскрол отключен по запросу пользователя
}

function navigateSuggestion(dir) {
  if (!suggestions.value.length) return
  highlightedIndex.value = Math.max(-1, Math.min(suggestions.value.length - 1, highlightedIndex.value + dir))
}

function selectHighlightedSuggestion() {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < suggestions.value.length) {
    selectSuggestion(suggestions.value[highlightedIndex.value])
  } else {
    showSuggestions.value = false
  }
}

function selectSuggestion(s) {
  const fullAddress = s.fullText || s.title || ''
  // Ставим флаг ДО изменения значения — чтобы input-событие на Android было проигнорировано
  addressSelected.value = true
  form.street = fullAddress
  showSuggestions.value = false
  suggestions.value = []
  highlightedIndex.value = -1
  
  nextTick(() => {
    if (streetInputRef.value) {
      streetInputRef.value.value = fullAddress
      streetInputRef.value.blur()
    }
  })
  
  geocodeFullAddress()
}

// --- Geocoding + MKAD check ---
let geocodeTimer = null
function geocodeFullAddress() {
  if (geocodeTimer) clearTimeout(geocodeTimer)
  geocodeTimer = setTimeout(async () => {
    const addr = buildFullAddress()
    if (!addr || addr.length < 5) {
      selectedCoords.value = null
      outsideMkad.value = false
      mapLoading.value = false
      return
    }
    mapLoading.value = true
    try {
      const resp = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=3e8e6276-8471-4559-b3b4-8c9947308b8c&geocode=${encodeURIComponent(addr)}&format=json&results=1&lang=ru_RU`)
      const data = await resp.json()
      const pos = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos
      if (pos) {
        const [lon, lat] = pos.split(' ').map(Number)
        selectedCoords.value = [lon, lat]
        outsideMkad.value = !isPointInsideMkad(lat, lon)
        pendingCoords = [lon, lat]
        await nextTick()
        // Ждем появления DOM-элемента с таймаутом (v-if может задержать создание элемента)
        let attempts = 0
        while (!mapContainerRef.value && attempts < 50) {
          await new Promise(r => requestAnimationFrame(r))
          attempts++
        }
        if (mapContainerRef.value) {
          await initOrUpdateMap(lon, lat)
        }
      }
    } catch (e) {
      selectedCoords.value = null
    } finally {
      mapLoading.value = false
    }
  }, 400)
}

function buildFullAddress() {
  let parts = ['Москва']
  if (form.street) parts.push(form.street)
  return parts.join(', ')
}

// Watch for map container appearing in DOM (v-if causes delayed mount)
watch(mapContainerRef, (el) => {
  if (el && pendingCoords) {
    const [lon, lat] = pendingCoords
    initOrUpdateMap(lon, lat)
  }
}, { flush: 'post' })

onUnmounted(() => {
  if (mapInstance) {
    try { mapInstance.destroy() } catch (e) {}
    mapInstance = null
    markerPlacemark = null
    mkadPolygonObj = null
    mapContainerEl = null
  }
})

// --- Yandex Map v2.1 ---
async function initOrUpdateMap(lon, lat) {
  if (!mapContainerRef.value) return
  try {
    if (!ymapsV2Loaded) {
      // Load script dynamically if not already loaded
      await loadYandexMapsScript()
      
      if (typeof window.ymaps === 'undefined') {
        console.error('[Map] ymaps not available after script load')
        return
      }
      
      if (window.ymapsV2Ready) {
        await window.ymapsV2Ready
      } else {
        await new Promise(resolve => window.ymaps.ready(resolve))
      }
      ymapsV2Loaded = true
      console.log('[Map] ymaps v2 ready!')
    }

    const ymaps = window.ymaps

    if (mapInstance && mapContainerEl === mapContainerRef.value) {
      try {
        mapInstance.setCenter([lat, lon], 14, { duration: 300 })
        if (markerPlacemark) {
          mapInstance.geoObjects.remove(markerPlacemark)
        }
        markerPlacemark = new ymaps.Placemark([lat, lon], {}, {
          preset: 'islands#blackDotIcon',
        })
        mapInstance.geoObjects.add(markerPlacemark)
        pendingCoords = null
        return
      } catch (e) {
        // Map DOM was invalidated, fall through to recreate
      }
    }

    // Destroy stale instance if DOM was re-created
    if (mapInstance) {
      try { mapInstance.destroy() } catch (e) {}
      mapInstance = null
      markerPlacemark = null
      mkadPolygonObj = null
    }

    mapContainerEl = mapContainerRef.value
    mapInstance = new ymaps.Map(mapContainerRef.value, {
      center: [lat, lon],
      zoom: 13,
      controls: [],
    }, {
      suppressMapOpenBlock: true,
    })

    // MKAD_POLYGON уже в формате [lat, lon] для Яндекс Карт
    mkadPolygonObj = new ymaps.Polygon([MKAD_POLYGON], {}, {
      strokeColor: '#000000',
      strokeWidth: 2,
      strokeOpacity: 0.5,
      fillColor: '#000000',
      fillOpacity: 0.04,
    })
    mapInstance.geoObjects.add(mkadPolygonObj)

    markerPlacemark = new ymaps.Placemark([lat, lon], {}, {
      preset: 'islands#blackDotIcon',
    })
    mapInstance.geoObjects.add(markerPlacemark)
    pendingCoords = null
  } catch (e) {
    console.error('[Map] Init error', e)
  }
}

// Watch for clarifyAddress toggle to clean up map
watch(() => form.clarifyAddress, (val) => {
  if (val) {
    selectedCoords.value = null
    outsideMkad.value = false
    if (mapInstance) {
      mapInstance.destroy()
      mapInstance = null
      markerPlacemark = null
      mkadPolygonObj = null
    }
  }
})

function setDate(daysFromNow) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  form.deliveryDate = date.toISOString().split('T')[0]
  v.deliveryDate = false
}

const isDateToday = computed(() => {
  if (!form.deliveryDate) return false
  return form.deliveryDate === new Date().toISOString().split('T')[0]
})

// Проверка доступности слотов для сегодня
const hasTodaySlots = computed(() => {
  const mskNow = new Date()
  const utcMs = mskNow.getTime() + mskNow.getTimezoneOffset() * 60000
  const msk = new Date(utcMs + 3 * 3600000)
  const currentHour = msk.getHours()
  
  // Если сейчас до 9 утра, то доставку можно выбрать только с 12:00
  const minStartHour = currentHour < 9 ? 12 : currentHour + 2
  
  // Доступные слоты: от 9-10 до 20-21
  // Последний слот начинается в 20:00
  return minStartHour <= 20
})

const isDateTomorrow = computed(() => {
  if (!form.deliveryDate) return false
  const t = new Date(); t.setDate(t.getDate() + 1)
  return form.deliveryDate === t.toISOString().split('T')[0]
})

const isDateDayAfterTomorrow = computed(() => {
  if (!form.deliveryDate) return false
  const d = new Date(); d.setDate(d.getDate() + 2)
  return form.deliveryDate === d.toISOString().split('T')[0]
})

function formatSelectedDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2)
  const selected = new Date(date); selected.setHours(0, 0, 0, 0)
  if (selected.getTime() === today.getTime()) return 'Сегодня'
  if (selected.getTime() === tomorrow.getTime()) return 'Завтра'
  if (selected.getTime() === dayAfter.getTime()) return 'Послезавтра'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function selectTime(value) {
  form.deliveryTime = value
  v.deliveryTime = false
  isTimeDropdownOpen.value = false
}

function toggleTimeDropdown() {
  isTimeDropdownOpen.value = !isTimeDropdownOpen.value
}

const selectedTimeLabel = computed(() => {
  const slot = timeSlots.value.find(s => s.value === form.deliveryTime)
  return slot ? slot.label : ''
})

function formatPhone(event, field) {
  let value = event.target.value.replace(/\D/g, '')
  if (value.startsWith('8')) value = '7' + value.slice(1)
  if (!value.startsWith('7')) value = '7' + value
  value = value.slice(0, 11)
  let formatted = '+7'
  if (value.length > 1) formatted += ' (' + value.slice(1, 4)
  if (value.length > 4) formatted += ') ' + value.slice(4, 7)
  if (value.length > 7) formatted += '-' + value.slice(7, 9)
  if (value.length > 9) formatted += '-' + value.slice(9, 11)
  form[field] = formatted
  v[field] = false
}

function formatRawPhone(rawNumber) {
  if (!rawNumber) return ''
  let value = rawNumber.replace(/\D/g, '')
  if (value.startsWith('8')) value = '7' + value.slice(1)
  if (!value.startsWith('7')) value = '7' + value
  value = value.slice(0, 11)
  let formatted = '+7'
  if (value.length > 1) formatted += ' (' + value.slice(1, 4)
  if (value.length > 4) formatted += ') ' + value.slice(4, 7)
  if (value.length > 7) formatted += '-' + value.slice(7, 9)
  if (value.length > 9) formatted += '-' + value.slice(9, 11)
  return formatted
}

function onPhoneFocus(event, field) {
  onFieldFocus(event)
  // Если поле пустое, устанавливаем начальное значение +7
  if (!form[field] || form[field].trim() === '') {
    form[field] = '+7'
  }
}

function validate() {
  v.deliveryDate = !form.deliveryDate
  v.deliveryTime = !form.deliveryTime
  v.buyerName = !form.buyerName.trim()
  v.buyerPhone = form.buyerPhone.replace(/\D/g, '').length !== 11
  v.recipientName = form.forOther && !form.recipientName.trim()
  v.recipientPhone = form.forOther && form.recipientPhone.replace(/\D/g, '').length !== 11
  if (!form.clarifyAddress) {
    v.street = !form.street.trim()
  } else {
    v.street = false
  }

  if (outsideMkad.value && !form.clarifyAddress) {
    throw new Error('OUTSIDE_MKAD')
  }

  return !Object.values(v).some(Boolean)
}

async function submit() {
  if (!validate()) throw new Error('VALIDATION_ERROR')
  
  // If not authenticated - throw error to show auth modal
  if (!props.isAuthenticated) {
    throw new Error('AUTH_REQUIRED')
  }
  
  await submitOrderWithUser(null)
}

async function submitWithOrder(bonusParams = {}) {
  if (!validate()) throw new Error('VALIDATION_ERROR')
  
  // If not authenticated - throw error to show auth modal
  if (!props.isAuthenticated) {
    throw new Error('AUTH_REQUIRED')
  }
  
  return await submitOrderWithUserAndReturn(null, bonusParams)
}

async function submitOrderWithUser(userId) {
  await submitOrderWithUserAndReturn(userId)
}

async function submitOrderWithUserAndReturn(userId, bonusParams = {}) {
  if (!validate()) throw new Error('VALIDATION_ERROR')

  const vasesArr = []
  for (const item of props.activeItems) {
    if (item.selectedVase && item.selectedVase.addonId) {
      const vase = props.allAddonsCache.find(a => a.id === item.selectedVase.addonId)
      if (vase) {
        vasesArr.push({
          id: vase.id,
          name: vase.name,
          quantity: item.selectedVase.quantity || 1,
          priceAmount: vase.priceAmount,
          forBouquetId: item.id,
          forBouquetName: item.name,
        })
      }
    }
  }

  const allAddons = [
    ...props.addons.map(addon => ({
      id: addon.id,
      name: addon.name,
      quantity: addon.quantity,
      priceAmount: addon.priceAmount,
    })),
    ...vasesArr,
  ]

  const order = await apiOrdersCreateRoute.run(ctx, {
    userId: userId || '',
    deliveryDate: form.deliveryDate,
    deliveryTime: form.deliveryTime,
    buyerName: form.buyerName,
    buyerPhone: form.buyerPhone,
    forOther: form.forOther,
    recipientName: form.recipientName,
    recipientPhone: form.recipientPhone,
    clarifyAddressWithRecipient: form.clarifyAddress,
    street: form.street,
    house: form.house,
    apartment: form.apartment,
    entrance: form.entrance,
    floor: form.floor,
    intercom: form.intercom,
    hasNote: form.hasNote,
    noteText: form.noteText,
    comment: form.comment,
    items: props.activeItems.map(item => ({
      id: item.id,
      name: item.name,
      imageHash: item.imageHash,
      quantity: item.quantity,
      priceAmount: item.priceAmount,
      isMono: item.isMono,
      stemsCount: item.stemsCount,
      step: item.step,
    })),
    addons: allAddons,
    totalPrice: props.totalPrice,
    saveAddress: form.saveAddress,
    addressType: form.addressType,
    bonusesToSpend: bonusParams.bonusesToSpend || 0,
    bonusDiscount: bonusParams.bonusDiscount || 0,
  })
  
  clearSavedForm()
  emit('submitted')
  
  return order
}

// Watch for form changes and save to localStorage
watch(() => form.deliveryDate, saveForm)
watch(() => form.deliveryTime, saveForm)
watch(() => form.buyerName, saveForm)
watch(() => form.buyerPhone, saveForm)
watch(() => form.forOther, saveForm)
watch(() => form.recipientName, saveForm)
watch(() => form.recipientPhone, saveForm)
watch(() => form.clarifyAddress, saveForm)
watch(() => form.street, saveForm)
watch(() => form.apartment, saveForm)
watch(() => form.entrance, saveForm)
watch(() => form.floor, saveForm)
watch(() => form.intercom, saveForm)
watch(() => form.hasNote, saveForm)
watch(() => form.noteText, saveForm)
watch(() => form.comment, saveForm)

// Автосохранение адреса при переключении типа Дом/Работа
let addressSaveTimeout = null
watch(() => form.addressType, async (newType) => {
  if (!props.isAuthenticated || !form.saveAddress || !form.street) return
  
  if (addressSaveTimeout) clearTimeout(addressSaveTimeout)
  
  addressSaveTimeout = setTimeout(async () => {
    try {
      const addressData = {
        street: form.street,
        house: form.house || '',
        apartment: form.apartment || '',
        entrance: form.entrance || '',
        floor: form.floor || '',
        intercom: form.intercom || '',
      }
      
      if (newType === 'home') {
        await apiProfileUpdateRoute.run(ctx, {
          ...addressData,
          workStreet: workAddress.value?.street || '',
          workHouse: workAddress.value?.house || '',
          workApartment: workAddress.value?.apartment || '',
          workEntrance: workAddress.value?.entrance || '',
          workFloor: workAddress.value?.floor || '',
          workIntercom: workAddress.value?.intercom || '',
        })
        // Обновляем homeAddress в UI
        homeAddress.value = { ...addressData }
      } else {
        await apiProfileUpdateRoute.run(ctx, {
          street: homeAddress.value?.street || '',
          house: homeAddress.value?.house || '',
          apartment: homeAddress.value?.apartment || '',
          entrance: homeAddress.value?.entrance || '',
          floor: homeAddress.value?.floor || '',
          intercom: homeAddress.value?.intercom || '',
          workStreet: addressData.street,
          workHouse: addressData.house,
          workApartment: addressData.apartment,
          workEntrance: addressData.entrance,
          workFloor: addressData.floor,
          workIntercom: addressData.intercom,
        })
        // Обновляем workAddress в UI
        workAddress.value = { ...addressData }
      }
    } catch (e) {
      console.error('[Address Save] Failed to save address:', e)
    }
  }, 500)
})

function clearForm() {
  form.deliveryDate = ''
  form.deliveryTime = ''
  form.buyerName = ''
  form.buyerPhone = ''
  form.forOther = false
  form.recipientName = ''
  form.recipientPhone = ''
  form.clarifyAddress = false
  form.street = ''
  form.apartment = ''
  form.entrance = ''
  form.floor = ''
  form.intercom = ''
  form.hasNote = false
  form.noteText = ''
  form.comment = ''
  form.saveAddress = false
  form.addressType = 'home'
  useSavedAddress.value = false
  selectedCoords.value = null
  outsideMkad.value = false
  clearSavedForm()
}

defineExpose({ submit, submitWithOrder, clearForm, hasAnyFormField })
</script>

<style scoped>
.form-grid { display: flex; flex-direction: column; gap: 16px; padding-bottom: 12px; }
.form-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.form-field.full { grid-column: 1 / -1; }
.form-label { font-size: 12px; font-weight: 600; color: #000; }
.req { color: var(--color-secondary); }

.form-input, .form-textarea {
  height: 42px; padding: 0 12px; border-radius: 10px;
  border: 1.5px solid var(--color-border); font-size: 14px; color: #000;
  background: var(--color-light-bg); outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
}
.form-input::placeholder { font-size: 11px; color: #888; }
.form-textarea::placeholder { font-size: 11px; color: #888; }
.form-textarea { height: auto; padding: 10px 12px; resize: vertical; min-height: 42px; }
.form-input:focus, .form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-hover-bg);
  background: var(--color-white);
}
.form-input.error, .form-textarea.error { border-color: var(--color-error); }
.form-error { font-size: 11px; color: var(--color-error); line-height: 1; }

.quick-date-btns { display: flex; gap: 8px; }
.quick-btn {
  flex: 1; height: 36px; border-radius: 8px;
  border: 1px solid var(--color-border); background: var(--color-white);
  color: #000; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 0.2s, border-color 0.2s; font-family: inherit;
}
.quick-btn:hover { background: var(--color-border-light); border-color: var(--color-primary); }
.quick-btn.active { background: var(--color-primary); color: var(--color-white); border-color: var(--color-primary); }
.quick-btn.error { border-color: var(--color-error); }
.quick-btn.disabled { 
  opacity: 0.5; 
  cursor: not-allowed; 
  background: var(--color-surface); 
  border-color: var(--color-border-light);
  color: var(--color-text-soft);
}
.quick-btn.disabled:hover { 
  background: var(--color-surface); 
  border-color: var(--color-border-light);
}

.selected-date {
  margin-top: 8px; padding: 8px 12px; background: var(--color-border-light);
  border-radius: 8px; font-size: 13px; font-weight: 600; color: #000; text-align: center;
}

.toggle-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 500; color: #000;
  cursor: pointer; padding: 6px 0; user-select: none;
}
.toggle-wrap { position: relative; flex-shrink: 0; }
.toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle-track {
  display: block; width: 42px; height: 24px; border-radius: 12px;
  background: var(--color-toggle-off); transition: background 0.25s; position: relative;
}
.toggle-input:checked + .toggle-track { background: var(--color-primary); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
  border-radius: 50%; background: var(--color-white);
  box-shadow: 0 1px 4px var(--color-overlay-light); transition: transform 0.25s;
}
.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(18px); }

.time-dropdown-wrapper { position: relative; }
.time-dropdown-trigger {
  width: 100%; height: 42px; padding: 0 12px; border-radius: 10px;
  border: 1.5px solid var(--color-border); background: var(--color-light-bg);
  color: #000; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
  display: flex; align-items: center; justify-content: space-between; outline: none;
}
.time-dropdown-trigger:hover { border-color: var(--color-primary); background: var(--color-white); }
.time-dropdown-trigger.active { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-hover-bg); background: var(--color-white); }
.time-dropdown-trigger.error { border-color: var(--color-error); }
.time-dropdown-trigger.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-surface);
}
.time-dropdown-trigger.disabled:hover {
  border-color: var(--color-border);
  background: var(--color-surface);
}
.time-dropdown-value { flex: 1; text-align: left; }
.time-dropdown-placeholder { flex: 1; text-align: left; color: #9ca3af; font-weight: 400; }
.time-dropdown-trigger .fa-chevron-down { font-size: 12px; transition: transform 0.2s; }
.time-dropdown-trigger .fa-chevron-down.rotated { transform: rotate(180deg); }

.time-slots-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 10;
  background: var(--color-white); border-radius: 10px;
  border: 1.5px solid var(--color-border); box-shadow: 0 4px 16px var(--color-shadow);
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  max-height: 320px; overflow-y: auto; padding: 8px;
}
.time-slot {
  width: 100%; height: 40px; border-radius: 8px;
  border: 1.5px solid var(--color-border);
  color: #000; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* Цвета по периодам дня */
.time-slot.period-morning {
  background: #E9F1F7;
  border-color: #d0e0ec;
}
.time-slot.period-morning:hover {
  background: #dde8f0;
  border-color: #b8d0e0;
  box-shadow: 0 2px 8px rgba(100, 140, 180, 0.15);
}

.time-slot.period-day {
  background: #F0EADF;
  border-color: #e0d5c8;
}
.time-slot.period-day:hover {
  background: #e8dfc8;
  border-color: #d4c8b8;
  box-shadow: 0 2px 8px rgba(180, 160, 120, 0.15);
}

.time-slot.period-evening {
  background: #E8E3EE;
  border-color: #d5cee0;
}
.time-slot.period-evening:hover {
  background: #ded8e8;
  border-color: #c8c0d8;
  box-shadow: 0 2px 8px rgba(150, 130, 180, 0.15);
}

/* Выбранный слот — всегда чёрный */
.time-slot.selected {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-white) !important;
}
.time-slot.selected:hover {
  background: var(--color-primary-dark) !important;
  border-color: var(--color-primary-dark) !important;
}

.saved-addr-selector { display: flex; gap: 8px; flex-wrap: wrap; }
.saved-addr-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 10px; border-radius: 12px;
  border: 1.5px solid var(--color-border); background: var(--color-white);
  color: #000; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: inherit; text-align: center;
  min-width: 100px;
}
.saved-addr-btn i { font-size: 18px; margin-bottom: 2px; }
.saved-addr-btn:hover { border-color: var(--color-primary); background: var(--color-primary-hover-bg); }
.saved-addr-btn.active { background: var(--color-primary); color: var(--color-white); border-color: var(--color-primary); }
.saved-addr-preview { font-size: 11px; font-weight: 400; opacity: 0.8; line-height: 1.3; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 400px) {
  .saved-addr-btn { padding: 10px 6px; font-size: 12px; min-width: 80px; }
  .saved-addr-btn i { font-size: 16px; }
  .saved-addr-preview { font-size: 10px; }
}

/* Address suggest */
.address-field-wrapper { position: relative; width: 100%; }
.suggest-wrapper { position: relative; width: 100%; }
.address-field-wrapper .form-input { width: 100%; }
.address-field-wrapper .form-input.with-clear { padding-right: 44px; }

.input-clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--color-error);
  background: transparent;
  color: var(--color-error);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  z-index: 5;
}
.input-clear-btn:hover {
  background: var(--color-error);
  color: var(--color-white);
}
.input-clear-btn i {
  font-size: 12px;
}
.clear-btn-text {
  font-size: 12px;
}

.cross-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  transition: all 0.2s ease;
}
.cross-btn svg {
  width: 16px;
  height: 16px;
}
.cross-btn:hover {
  background: var(--color-surface);
  color: var(--color-text-dark);
}

.suggestions-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 20;
  background: var(--color-white); border-radius: 12px;
  border: 1.5px solid var(--color-border);
  box-shadow: 0 8px 24px var(--color-shadow-medium);
  max-height: 280px; overflow-y: auto; padding: 6px;
}

.suggestion-item {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px; border: none;
  background: transparent; cursor: pointer; text-align: left;
  transition: background 0.15s; font-family: inherit;
}
.suggestion-item:hover, .suggestion-item.highlighted {
  background: var(--color-border-light);
}
.suggestion-item i {
  font-size: 14px; color: var(--color-secondary); flex-shrink: 0;
}
.suggestion-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.suggestion-title { font-size: 14px; font-weight: 500; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.suggestion-subtitle { font-size: 12px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* MKAD warning */
.mkad-warning {
  grid-column: 1 / -1;
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border: 1.5px solid #fecaca;
  border-radius: 14px;
  animation: mkad-shake 0.4s ease;
  margin-top: 16px;
}
.mkad-warning-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: #fee2e2; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mkad-warning-icon i { font-size: 20px; color: #dc2626; }
.mkad-warning-content { display: flex; flex-direction: column; gap: 3px; }
.mkad-warning-title { font-size: 14px; font-weight: 700; color: #991b1b; line-height: 1.3; }
.mkad-warning-text { font-size: 12px; color: #b91c1c; line-height: 1.4; }

/* Позиционирование поверх полей */
.address-block { position: relative; }

@keyframes mkad-shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-4px); }
  30% { transform: translateX(4px); }
  45% { transform: translateX(-3px); }
  60% { transform: translateX(2px); }
  75% { transform: translateX(-1px); }
}

/* Map */
.map-container {
  width: 100%; height: 200px; border-radius: 14px; overflow: hidden;
  border: 1.5px solid var(--color-border);
  position: relative;
  background: var(--color-light-bg);
}
.map-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-light-bg) 0%,
    var(--color-surface) 50%,
    var(--color-light-bg) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.address-row { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.address-row .form-field { min-width: 0; }

/* Save address block */
.save-address-block {
  margin-top: 16px;
  padding: 9px;
  background: var(--color-light-bg);
  border-radius: 12px;
  border: 1.5px solid var(--color-border);
}
.save-address-text {
  font-size: 14px;
  font-weight: 500;
  color: #000;
}
.address-type-selector {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.address-type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  background: var(--color-white);
  color: #000;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.address-type-btn i {
  font-size: 14px;
  color: var(--color-secondary);
}
.address-type-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-hover-bg);
}
.address-type-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
.address-type-btn.active i {
  color: var(--color-white);
}

/* Form blocks */
.form-block {
  background: var(--color-light-bg, #FAFAFA);
  border-radius: 14px;
  border: 1px solid var(--color-border-light, rgba(0,0,0,0.06));
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-block > *:first-child {
  margin-top: 0;
}
.form-block-title {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  letter-spacing: -0.01em;
}
.form-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.clear-address-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-error);
  background: transparent;
  color: var(--color-error);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.clear-address-btn:hover {
  background: var(--color-error);
  color: var(--color-white);
}
.clear-address-btn i {
  font-size: 12px;
}
.form-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-row.two-col .form-field {
  min-width: 0;
}

@media (max-width: 480px) {
  .form-row.two-col {
    grid-template-columns: 1fr;
  }
  .form-block {
    padding: 14px;
  }
}

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease-out; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px); }

.mkad-banner-enter-active { transition: all 0.3s ease; }
.mkad-banner-leave-active { transition: all 0.25s ease; }
.mkad-banner-enter-from { opacity: 0; transform: translateY(-8px); max-height: 0; }
.mkad-banner-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-field.full { grid-column: 1; }
  .address-row { gap: 6px; grid-template-columns: repeat(4, 1fr); }
  .address-row .form-field { min-width: 0; }
  .map-container { height: 180px; }
}
</style>