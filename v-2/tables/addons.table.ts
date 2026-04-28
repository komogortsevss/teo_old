// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoAddonsYnf = Heap.Table(
  't_v_2_teo_addons_Ynf',
  {
    name: Heap.Optional(Heap.String({ customMeta: { title: 'Название' } })),
    imageHash: Heap.Optional(Heap.String({ customMeta: { title: 'Изображение' } })),
    price: Heap.Optional(Heap.Money({ customMeta: { title: 'Цена' } })),
    icon: Heap.Optional(Heap.String({ customMeta: { title: 'Иконка (FontAwesome)' } })),
    type: Heap.Optional(Heap.String({ customMeta: { title: 'Тип (regular/vase)' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок сортировки' } })),
    isActive: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Активен' } })),
  },
  { customMeta: { title: 'Дополнительные товары', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoAddonsYnf {
  export type T = typeof TV2TeoAddonsYnf.T
  export type JsonT = typeof TV2TeoAddonsYnf.JsonT
  export type PropsT = typeof TV2TeoAddonsYnf.PropsT
  export type PatchT = typeof TV2TeoAddonsYnf.PatchT
  export type CreateInputT = typeof TV2TeoAddonsYnf.CreateInputT
}

export default TV2TeoAddonsYnf

export type TV2TeoAddonsYnfRow = TV2TeoAddonsYnf.T
export type TV2TeoAddonsYnfRowJson = TV2TeoAddonsYnf.JsonT
