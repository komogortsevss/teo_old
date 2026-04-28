// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoPromoCodesPaH = Heap.Table(
  't_v_2_teo_promoCodes_paH',
  {
    code: Heap.Optional(Heap.String({ customMeta: { title: 'Код промокода' }, searchable: { langs: ['ru', 'en'] } })),
    title: Heap.Optional(Heap.String({ customMeta: { title: 'Название/описание' } })),
    discountType: Heap.Optional(
      Heap.Enum({ enumKey1: 'fixed', enumKey2: 'percent' }, { customMeta: { title: 'Тип скидки' } }),
    ),
    discountValue: Heap.Optional(Heap.Money({ customMeta: { title: 'Размер скидки' } })),
    minOrderAmount: Heap.Optional(Heap.Money({ customMeta: { title: 'Минимальная сумма заказа' } })),
    maxDiscount: Heap.Optional(Heap.Money({ customMeta: { title: 'Максимальная скидка (для процентов)' } })),
    usageLimit: Heap.Optional(Heap.Number({ customMeta: { title: 'Лимит использований (0 = без ограничений)' } })),
    usageCount: Heap.Optional(Heap.Number({ customMeta: { title: 'Счётчик использований' } })),
    startAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Дата начала действия' } })),
    endAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Дата окончания действия' } })),
    isSingleUse: Heap.Optional(
      Heap.Boolean({ customMeta: { title: 'Одноразовый (один клиент = одно использование)' } }),
    ),
    isActive: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Активен' } })),
    allowedProducts: Heap.Optional(Heap.String({ customMeta: { title: 'Разрешённые товары (JSON массив ID)' } })),
    excludedProducts: Heap.Optional(Heap.String({ customMeta: { title: 'Исключённые товары (JSON массив ID)' } })),
  },
  { customMeta: { title: 'Промокоды', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoPromoCodesPaH {
  export type T = typeof TV2TeoPromoCodesPaH.T
  export type JsonT = typeof TV2TeoPromoCodesPaH.JsonT
  export type PropsT = typeof TV2TeoPromoCodesPaH.PropsT
  export type PatchT = typeof TV2TeoPromoCodesPaH.PatchT
  export type CreateInputT = typeof TV2TeoPromoCodesPaH.CreateInputT
}

export default TV2TeoPromoCodesPaH

export type TV2TeoPromoCodesPaHRow = TV2TeoPromoCodesPaH.T
export type TV2TeoPromoCodesPaHRowJson = TV2TeoPromoCodesPaH.JsonT
