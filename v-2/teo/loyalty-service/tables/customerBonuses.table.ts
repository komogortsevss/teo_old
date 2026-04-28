// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoCustomerBonuses4Ko = Heap.Table(
  't_v_2_teo_customerBonuses_4Ko',
  {
    customerId: Heap.Optional(Heap.RefLink('t_v_2_teo_customers_xRu', { customMeta: { title: 'Клиент' } })),
    balance: Heap.Optional(Heap.Number({ customMeta: { title: 'Текущий баланс' } })),
    totalEarned: Heap.Optional(Heap.Number({ customMeta: { title: 'Всего начислено' } })),
    totalSpent: Heap.Optional(Heap.Number({ customMeta: { title: 'Всего потрачено' } })),
    lastTransactionAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Последняя транзакция' } })),
  },
  { customMeta: { title: 'Балансы бонусов клиентов', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoCustomerBonuses4Ko {
  export type T = typeof TV2TeoCustomerBonuses4Ko.T
  export type JsonT = typeof TV2TeoCustomerBonuses4Ko.JsonT
  export type PropsT = typeof TV2TeoCustomerBonuses4Ko.PropsT
  export type PatchT = typeof TV2TeoCustomerBonuses4Ko.PatchT
  export type CreateInputT = typeof TV2TeoCustomerBonuses4Ko.CreateInputT
}

export default TV2TeoCustomerBonuses4Ko

export type TV2TeoCustomerBonuses4KoRow = TV2TeoCustomerBonuses4Ko.T
export type TV2TeoCustomerBonuses4KoRowJson = TV2TeoCustomerBonuses4Ko.JsonT
