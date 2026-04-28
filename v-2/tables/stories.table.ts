// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoStoriesUmK = Heap.Table(
  't_v_2_teo_stories_UmK',
  {
    label: Heap.Optional(Heap.String({ customMeta: { title: 'Название' } })),
    coverHash: Heap.Optional(Heap.String({ customMeta: { title: 'Обложка (hash)' } })),
    slides: Heap.Optional(Heap.Any()),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок' } })),
    isActive: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Активна' } })),
  },
  { customMeta: { title: 'Сторис', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoStoriesUmK {
  export type T = typeof TV2TeoStoriesUmK.T
  export type JsonT = typeof TV2TeoStoriesUmK.JsonT
  export type PropsT = typeof TV2TeoStoriesUmK.PropsT
  export type PatchT = typeof TV2TeoStoriesUmK.PatchT
  export type CreateInputT = typeof TV2TeoStoriesUmK.CreateInputT
}

export default TV2TeoStoriesUmK

export type TV2TeoStoriesUmKRow = TV2TeoStoriesUmK.T
export type TV2TeoStoriesUmKRowJson = TV2TeoStoriesUmK.JsonT
