// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoOrdersLWg = Heap.Table(
  't_v_2_teo_orders_lWg',
  {
    customerId: Heap.Optional(Heap.RefLink('t_v_2_teo_customers_xRu', { customMeta: { title: 'Клиент' } })),
    status: Heap.Optional(Heap.String({ customMeta: { title: 'Статус' }, searchable: { langs: ['ru', 'en'] } })),
    items: Heap.Optional(Heap.String({ customMeta: { title: 'Товары (JSON)' } })),
    subtotal: Heap.Optional(Heap.Money({ customMeta: { title: 'Сумма товаров' } })),
    deliveryCost: Heap.Optional(Heap.Money({ customMeta: { title: 'Стоимость доставки' } })),
    discountAmount: Heap.Optional(Heap.Money({ customMeta: { title: 'Скидка по промокоду' } })),
    promoCodeId: Heap.Optional(Heap.String({ customMeta: { title: 'ID промокода' } })),
    promoCode: Heap.Optional(Heap.String({ customMeta: { title: 'Промокод' } })),
    bonusAmount: Heap.Optional(Heap.Number({ customMeta: { title: 'Списано бонусов' } })),
    bonusEarned: Heap.Optional(Heap.Number({ customMeta: { title: 'Начислено бонусов' } })),
    total: Heap.Optional(Heap.Money({ customMeta: { title: 'Итоговая сумма' } })),
    deliveryAddress: Heap.Optional(
      Heap.String({ customMeta: { title: 'Адрес доставки' }, searchable: { langs: ['ru', 'en'] } }),
    ),
    deliveryDate: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Дата доставки' } })),
    recipientName: Heap.Optional(Heap.String({ customMeta: { title: 'Имя получателя' } })),
    recipientPhone: Heap.Optional(Heap.String({ customMeta: { title: 'Телефон получателя' } })),
    comment: Heap.Optional(Heap.String({ customMeta: { title: 'Комментарий' } })),
    paidAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Дата оплаты' } })),
  },
  { customMeta: { title: 'Заказы', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoOrdersLWg {
  export type T = typeof TV2TeoOrdersLWg.T
  export type JsonT = typeof TV2TeoOrdersLWg.JsonT
  export type PropsT = typeof TV2TeoOrdersLWg.PropsT
  export type PatchT = typeof TV2TeoOrdersLWg.PatchT
  export type CreateInputT = typeof TV2TeoOrdersLWg.CreateInputT
}

export default TV2TeoOrdersLWg

export type TV2TeoOrdersLWgRow = TV2TeoOrdersLWg.T
export type TV2TeoOrdersLWgRowJson = TV2TeoOrdersLWg.JsonT
