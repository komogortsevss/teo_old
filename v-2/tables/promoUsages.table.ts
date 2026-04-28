// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoPromoUsagesYQR = Heap.Table(
  't_v_2_teo_promoUsages_YQR',
  {
    promoCodeId: Heap.Optional(Heap.String({ customMeta: { title: 'ID промокода' } })),
    orderId: Heap.Optional(Heap.String({ customMeta: { title: 'ID заказа' } })),
    customerId: Heap.Optional(Heap.String({ customMeta: { title: 'ID клиента' } })),
    originalAmount: Heap.Optional(Heap.Money({ customMeta: { title: 'Сумма корзины до скидки' } })),
    discountAmount: Heap.Optional(Heap.Money({ customMeta: { title: 'Сумма скидки' } })),
    finalAmount: Heap.Optional(Heap.Money({ customMeta: { title: 'Итоговая сумма после скидки' } })),
    appliedAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Дата применения' } })),
    status: Heap.Optional(
      Heap.Enum(
        { enumKey1: 'applied', enumKey2: 'cancelled', enumKey3: 'refunded' },
        { customMeta: { title: 'Статус' } },
      ),
    ),
  },
  { customMeta: { title: 'Использования промокодов', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoPromoUsagesYQR {
  export type T = typeof TV2TeoPromoUsagesYQR.T
  export type JsonT = typeof TV2TeoPromoUsagesYQR.JsonT
  export type PropsT = typeof TV2TeoPromoUsagesYQR.PropsT
  export type PatchT = typeof TV2TeoPromoUsagesYQR.PatchT
  export type CreateInputT = typeof TV2TeoPromoUsagesYQR.CreateInputT
}

export default TV2TeoPromoUsagesYQR

export type TV2TeoPromoUsagesYQRRow = TV2TeoPromoUsagesYQR.T
export type TV2TeoPromoUsagesYQRRowJson = TV2TeoPromoUsagesYQR.JsonT
