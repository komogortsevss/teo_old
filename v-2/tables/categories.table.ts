// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoCategoriesC9R = Heap.Table(
  't_v_2_teo_categories_c9R',
  {
    name: Heap.Optional(Heap.String({ customMeta: { title: 'Название' }, searchable: { langs: ['ru', 'en'] } })),
    slug: Heap.Optional(Heap.String({ customMeta: { title: 'Slug' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок сортировки' } })),
  },
  { customMeta: { title: 'Категории букетов', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoCategoriesC9R {
  export type T = typeof TV2TeoCategoriesC9R.T
  export type JsonT = typeof TV2TeoCategoriesC9R.JsonT
  export type PropsT = typeof TV2TeoCategoriesC9R.PropsT
  export type PatchT = typeof TV2TeoCategoriesC9R.PatchT
  export type CreateInputT = typeof TV2TeoCategoriesC9R.CreateInputT
}

export default TV2TeoCategoriesC9R

export type TV2TeoCategoriesC9RRow = TV2TeoCategoriesC9R.T
export type TV2TeoCategoriesC9RRowJson = TV2TeoCategoriesC9R.JsonT
