// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoBonusTransactions5y9 = Heap.Table(
  't_v_2_teo_bonusTransactions_5y9',
  {
    customerId: Heap.Optional(Heap.RefLink('t_v_2_teo_customers_xRu', { customMeta: { title: 'Клиент' } })),
    orderId: Heap.Optional(Heap.String({ customMeta: { title: 'ID заказа' } })),
    type: Heap.Optional(Heap.String({ customMeta: { title: 'Тип операции' }, searchable: { langs: ['ru', 'en'] } })),
    amount: Heap.Optional(Heap.Number({ customMeta: { title: 'Количество бонусов' } })),
    balanceAfter: Heap.Optional(Heap.Number({ customMeta: { title: 'Баланс после операции' } })),
    description: Heap.Optional(Heap.String({ customMeta: { title: 'Описание' }, searchable: { langs: ['ru', 'en'] } })),
    expiresAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Срок действия' } })),
    isExpired: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Истек срок' } })),
    adminId: Heap.Optional(Heap.String({ customMeta: { title: 'ID администратора' } })),
  },
  { customMeta: { title: 'Транзакции бонусов', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoBonusTransactions5y9 {
  export type T = typeof TV2TeoBonusTransactions5y9.T
  export type JsonT = typeof TV2TeoBonusTransactions5y9.JsonT
  export type PropsT = typeof TV2TeoBonusTransactions5y9.PropsT
  export type PatchT = typeof TV2TeoBonusTransactions5y9.PatchT
  export type CreateInputT = typeof TV2TeoBonusTransactions5y9.CreateInputT
}

export default TV2TeoBonusTransactions5y9

export type TV2TeoBonusTransactions5y9Row = TV2TeoBonusTransactions5y9.T
export type TV2TeoBonusTransactions5y9RowJson = TV2TeoBonusTransactions5y9.JsonT
