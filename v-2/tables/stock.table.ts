// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoStock57I = Heap.Table(
  't_v_2_teo_stock_57I',
  {
    flower: Heap.Optional(Heap.RefLink('t_v_2_teo_flowers_YV8', { customMeta: { title: 'Цветок' } })),
    quantity: Heap.Optional(Heap.Number({ customMeta: { title: 'Количество в наличии (стеблей)' } })),
  },
  { customMeta: { title: 'Складской учёт', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoStock57I {
  export type T = typeof TV2TeoStock57I.T
  export type JsonT = typeof TV2TeoStock57I.JsonT
  export type PropsT = typeof TV2TeoStock57I.PropsT
  export type PatchT = typeof TV2TeoStock57I.PatchT
  export type CreateInputT = typeof TV2TeoStock57I.CreateInputT
}

export default TV2TeoStock57I

export type TV2TeoStock57IRow = TV2TeoStock57I.T
export type TV2TeoStock57IRowJson = TV2TeoStock57I.JsonT
