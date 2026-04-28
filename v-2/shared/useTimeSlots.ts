// @shared

import { computed, watch, type Ref } from 'vue'

export type DayPeriod = 'morning' | 'day' | 'evening'

interface TimeSlot {
  value: string
  label: string
  period: DayPeriod
}

const ALL_TIME_SLOTS: TimeSlot[] = [
  { value: '9-10', label: '9:00 - 10:00', period: 'morning' },
  { value: '10-11', label: '10:00 - 11:00', period: 'morning' },
  { value: '11-12', label: '11:00 - 12:00', period: 'morning' },
  { value: '12-13', label: '12:00 - 13:00', period: 'day' },
  { value: '13-14', label: '13:00 - 14:00', period: 'day' },
  { value: '14-15', label: '14:00 - 15:00', period: 'day' },
  { value: '15-16', label: '15:00 - 16:00', period: 'day' },
  { value: '16-17', label: '16:00 - 17:00', period: 'day' },
  { value: '17-18', label: '17:00 - 18:00', period: 'evening' },
  { value: '18-19', label: '18:00 - 19:00', period: 'evening' },
  { value: '19-20', label: '19:00 - 20:00', period: 'evening' },
  { value: '20-21', label: '20:00 - 21:00', period: 'evening' },
]

function getMoscowNow(): Date {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utcMs + 3 * 3600000)
}

function getMoscowDateStr(offset: number): string {
  const msk = getMoscowNow()
  msk.setDate(msk.getDate() + offset)
  const y = msk.getFullYear()
  const m = String(msk.getMonth() + 1).padStart(2, '0')
  const d = String(msk.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isToday(dateStr: string): boolean {
  return dateStr === getMoscowDateStr(0)
}

function isTomorrow(dateStr: string): boolean {
  return dateStr === getMoscowDateStr(1)
}

export function useTimeSlots(deliveryDate: Ref<string>, deliveryTime: Ref<string>) {
  const availableTimeSlots = computed<TimeSlot[]>(() => {
    const dateStr = deliveryDate.value
    if (!dateStr) return ALL_TIME_SLOTS

    const mskNow = getMoscowNow()
    const currentHour = mskNow.getHours()

    if (isToday(dateStr)) {
      // Если сейчас до 9 утра, то доставку можно выбрать только с 12:00
      const minStartHour = currentHour < 9 ? 12 : currentHour + 2
      return ALL_TIME_SLOTS.filter(slot => {
        const startHour = parseInt(slot.value.split('-')[0], 10)
        return startHour >= minStartHour
      })
    }

    if (isTomorrow(dateStr) && currentHour >= 19) {
      return ALL_TIME_SLOTS.filter(slot => {
        const startHour = parseInt(slot.value.split('-')[0], 10)
        return startHour >= 12
      })
    }

    return ALL_TIME_SLOTS
  })

  watch(deliveryDate, () => {
    if (!deliveryTime.value) return
    const stillAvailable = availableTimeSlots.value.some(s => s.value === deliveryTime.value)
    if (!stillAvailable) {
      deliveryTime.value = ''
    }
  })

  return { availableTimeSlots, ALL_TIME_SLOTS }
}
