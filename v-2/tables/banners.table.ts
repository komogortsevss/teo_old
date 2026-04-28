// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TV2TeoBannersTqBBVE = Heap.Table(
  't_v_2_t_v_2_teo_banners_TqB_bVE',
  {
    title: Heap.Optional(Heap.String({ customMeta: { title: 'Название' } })),
    imageHash: Heap.Optional(Heap.String({ customMeta: { title: 'Изображение (hash)' } })),
    link: Heap.Optional(Heap.String({ customMeta: { title: 'Ссылка' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок' } })),
    isActive: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Активен' } })),
  },
  { customMeta: { title: 'Баннеры блога', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TV2TeoBannersTqBBVE {
  export type T = typeof TV2TV2TeoBannersTqBBVE.T
  export type JsonT = typeof TV2TV2TeoBannersTqBBVE.JsonT
  export type PropsT = typeof TV2TV2TeoBannersTqBBVE.PropsT
  export type PatchT = typeof TV2TV2TeoBannersTqBBVE.PatchT
  export type CreateInputT = typeof TV2TV2TeoBannersTqBBVE.CreateInputT
}

export default TV2TV2TeoBannersTqBBVE

export type TV2TV2TeoBannersTqBBVERow = TV2TV2TeoBannersTqBBVE.T
export type TV2TV2TeoBannersTqBBVERowJson = TV2TV2TeoBannersTqBBVE.JsonT
