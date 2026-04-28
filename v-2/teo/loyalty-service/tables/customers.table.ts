// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoCustomersXRu = Heap.Table(
  't_v_2_teo_customers_xRu',
  {
    maxId: Heap.Optional(Heap.String({ customMeta: { title: 'MAX ID' }, searchable: { langs: ['ru', 'en'] } })),
    chatId: Heap.Optional(Heap.String({ customMeta: { title: 'MAX Chat ID' } })),
    firstName: Heap.Optional(Heap.String({ customMeta: { title: 'Имя' }, searchable: { langs: ['ru', 'en'] } })),
    lastName: Heap.Optional(Heap.String({ customMeta: { title: 'Фамилия' }, searchable: { langs: ['ru', 'en'] } })),
    phone: Heap.Optional(Heap.String({ customMeta: { title: 'Телефон' }, searchable: { langs: ['ru', 'en'] } })),
    email: Heap.Optional(Heap.String({ customMeta: { title: 'Email' }, searchable: { langs: ['ru', 'en'] } })),
    isActive: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Активен' } })),
    lastLoginAt: Heap.Optional(Heap.DateTime({ customMeta: { title: 'Последний вход' } })),
  },
  { customMeta: { title: 'Клиенты', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoCustomersXRu {
  export type T = typeof TV2TeoCustomersXRu.T
  export type JsonT = typeof TV2TeoCustomersXRu.JsonT
  export type PropsT = typeof TV2TeoCustomersXRu.PropsT
  export type PatchT = typeof TV2TeoCustomersXRu.PatchT
  export type CreateInputT = typeof TV2TeoCustomersXRu.CreateInputT
}

export default TV2TeoCustomersXRu

export type TV2TeoCustomersXRuRow = TV2TeoCustomersXRu.T
export type TV2TeoCustomersXRuRowJson = TV2TeoCustomersXRu.JsonT
