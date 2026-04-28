// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2HeroVxX = Heap.Table(
  't_v_2_hero_vxX',
  {
    title: Heap.Optional(Heap.String({ customMeta: { title: 'Заголовок' }, searchable: { langs: ['ru', 'en'] } })),
    subtitle: Heap.Optional(
      Heap.String({ customMeta: { title: 'Подзаголовок' }, searchable: { langs: ['ru', 'en'] } }),
    ),
    buttonText: Heap.Optional(Heap.String({ customMeta: { title: 'Текст кнопки' } })),
    buttonLink: Heap.Optional(Heap.String({ customMeta: { title: 'Ссылка кнопки' } })),
    buttonPosition: Heap.Optional(Heap.String({ customMeta: { title: 'Позиция кнопки' } })),
    imageHash: Heap.Optional(Heap.String({ customMeta: { title: 'Изображение (Desktop)' } })),
    mobileImageHash: Heap.Optional(Heap.String({ customMeta: { title: 'Изображение (Mobile)' } })),
    sortOrder: Heap.Optional(Heap.Number({ customMeta: { title: 'Порядок сортировки' } })),
    isActive: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Активен' } })),
  },
  { customMeta: { title: 'Hero блок', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2HeroVxX {
  export type T = typeof TV2HeroVxX.T
  export type JsonT = typeof TV2HeroVxX.JsonT
  export type PropsT = typeof TV2HeroVxX.PropsT
  export type PatchT = typeof TV2HeroVxX.PatchT
  export type CreateInputT = typeof TV2HeroVxX.CreateInputT
}

export default TV2HeroVxX

export type TV2HeroVxXRow = TV2HeroVxX.T
export type TV2HeroVxXRowJson = TV2HeroVxX.JsonT
