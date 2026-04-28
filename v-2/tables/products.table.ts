// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoProductsMdn = Heap.Table(
  't_v_2_teo_products_Mdn',
  {
    name: Heap.Optional(
      Heap.String({ customMeta: { title: 'Название' }, searchable: { langs: ['ru', 'en'], embeddings: true } }),
    ),
    slug: Heap.Optional(
      Heap.String({ customMeta: { title: 'URL-адрес (slug)' }, searchable: { langs: ['ru', 'en'] } }),
    ),
    description: Heap.Optional(
      Heap.String({ customMeta: { title: 'Описание' }, searchable: { langs: ['ru', 'en'], embeddings: true } }),
    ),
    category: Heap.Optional(Heap.RefLink('t_v_2_teo_categories_c9R', { customMeta: { title: 'Категория' } })),
    price: Heap.Optional(Heap.Money({ customMeta: { title: 'Цена' } })),
    imageHash: Heap.Optional(Heap.String({ customMeta: { title: 'Фото (главное)' } })),
    imageHashes: Heap.Optional(Heap.Any()),
    stemsCount: Heap.Optional(Heap.Number({ customMeta: { title: 'Количество стеблей (для моно)' } })),
    isAvailable: Heap.Optional(Heap.Boolean({ customMeta: { title: 'В наличии' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок сортировки' } })),
    flowers: Heap.Optional(Heap.Any()),
    composition: Heap.Optional(Heap.Any()),
    availableAddons: Heap.Optional(Heap.Any()),
  },
  { customMeta: { title: 'Букеты', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoProductsMdn {
  export type T = typeof TV2TeoProductsMdn.T
  export type JsonT = typeof TV2TeoProductsMdn.JsonT
  export type PropsT = typeof TV2TeoProductsMdn.PropsT
  export type PatchT = typeof TV2TeoProductsMdn.PatchT
  export type CreateInputT = typeof TV2TeoProductsMdn.CreateInputT
}

export default TV2TeoProductsMdn

export type TV2TeoProductsMdnRow = TV2TeoProductsMdn.T
export type TV2TeoProductsMdnRowJson = TV2TeoProductsMdn.JsonT
