// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoOrdersGau = Heap.Table(
  't_v_2_teo_orders_gau',
  {
    orderNumber: Heap.Optional(Heap.String({ customMeta: { title: 'Номер заказа' } })),
    userId: Heap.Optional(Heap.String({ customMeta: { title: 'ID пользователя' } })),
    deliveryDate: Heap.Optional(Heap.String({ customMeta: { title: 'Дата доставки' } })),
    deliveryTime: Heap.Optional(Heap.String({ customMeta: { title: 'Время доставки' } })),
    buyerName: Heap.Optional(
      Heap.String({ customMeta: { title: 'Имя заказчика' }, searchable: { langs: ['ru', 'en'] } }),
    ),
    buyerPhone: Heap.Optional(
      Heap.String({ customMeta: { title: 'Телефон заказчика' }, searchable: { langs: ['ru', 'en'] } }),
    ),
    forOther: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Букет для другого человека' } })),
    recipientName: Heap.Optional(Heap.String({ customMeta: { title: 'Имя получателя' } })),
    recipientPhone: Heap.Optional(Heap.String({ customMeta: { title: 'Телефон получателя' } })),
    clarifyAddressWithRecipient: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Уточнить адрес у получателя' } })),
    street: Heap.Optional(Heap.String({ customMeta: { title: 'Улица' }, searchable: { langs: ['ru', 'en'] } })),
    house: Heap.Optional(Heap.String({ customMeta: { title: 'Дом' } })),
    apartment: Heap.Optional(Heap.String({ customMeta: { title: 'Квартира' } })),
    entrance: Heap.Optional(Heap.String({ customMeta: { title: 'Подъезд' } })),
    floor: Heap.Optional(Heap.String({ customMeta: { title: 'Этаж' } })),
    intercom: Heap.Optional(Heap.String({ customMeta: { title: 'Код домофона' } })),
    hasNote: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Записка прикреплена' } })),
    noteText: Heap.Optional(Heap.String({ customMeta: { title: 'Текст записки' } })),
    comment: Heap.Optional(Heap.String({ customMeta: { title: 'Комментарий к заказу' } })),
    items: Heap.Optional(Heap.Any()),
    addons: Heap.Optional(Heap.Any()),
    totalPrice: Heap.Optional(Heap.Number({ customMeta: { title: 'Общая сумма' } })),
    bonusesToSpend: Heap.Optional(Heap.Number({ customMeta: { title: 'Списано бонусов' } })),
    bonusDiscount: Heap.Optional(Heap.Number({ customMeta: { title: 'Скидка бонусами' } })),
    bonusesEarned: Heap.Optional(Heap.Number({ customMeta: { title: 'Начислено бонусов' } })),
    status: Heap.Optional(Heap.String({ customMeta: { title: 'Статус заказа' } })),
  },
  { customMeta: { title: 'Заказы', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoOrdersGau {
  export type T = typeof TV2TeoOrdersGau.T
  export type JsonT = typeof TV2TeoOrdersGau.JsonT
  export type PropsT = typeof TV2TeoOrdersGau.PropsT
  export type PatchT = typeof TV2TeoOrdersGau.PatchT
  export type CreateInputT = typeof TV2TeoOrdersGau.CreateInputT
}

export default TV2TeoOrdersGau

export type TV2TeoOrdersGauRow = TV2TeoOrdersGau.T
export type TV2TeoOrdersGauRowJson = TV2TeoOrdersGau.JsonT
