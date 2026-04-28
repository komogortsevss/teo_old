// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoFlowersYV8 = Heap.Table(
  't_v_2_teo_flowers_YV8',
  {
    name: Heap.Optional(Heap.String({ customMeta: { title: 'Название цветка' }, searchable: { langs: ['ru', 'en'] } })),
    slug: Heap.Optional(Heap.String({ customMeta: { title: 'Slug (идентификатор)' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок сортировки' } })),
  },
  { customMeta: { title: 'Цветы', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoFlowersYV8 {
  export type T = typeof TV2TeoFlowersYV8.T
  export type JsonT = typeof TV2TeoFlowersYV8.JsonT
  export type PropsT = typeof TV2TeoFlowersYV8.PropsT
  export type PatchT = typeof TV2TeoFlowersYV8.PatchT
  export type CreateInputT = typeof TV2TeoFlowersYV8.CreateInputT
}

export default TV2TeoFlowersYV8

export type TV2TeoFlowersYV8Row = TV2TeoFlowersYV8.T
export type TV2TeoFlowersYV8RowJson = TV2TeoFlowersYV8.JsonT
