// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TV2TeoProfilesGauJn7 = Heap.Table(
  't_v_2_t_v_2_teo_profiles_gau_Jn7',
  {
    userId: Heap.Optional(Heap.String({ customMeta: { title: 'ID пользователя' } })),
    street: Heap.Optional(Heap.String({ customMeta: { title: 'Улица (дом)' } })),
    house: Heap.Optional(Heap.String({ customMeta: { title: 'Дом (дом)' } })),
    apartment: Heap.Optional(Heap.String({ customMeta: { title: 'Квартира (дом)' } })),
    entrance: Heap.Optional(Heap.String({ customMeta: { title: 'Подъезд (дом)' } })),
    floor: Heap.Optional(Heap.String({ customMeta: { title: 'Этаж (дом)' } })),
    intercom: Heap.Optional(Heap.String({ customMeta: { title: 'Домофон (дом)' } })),
    workStreet: Heap.Optional(Heap.String({ customMeta: { title: 'Улица (работа)' } })),
    workHouse: Heap.Optional(Heap.String({ customMeta: { title: 'Дом (работа)' } })),
    workApartment: Heap.Optional(Heap.String({ customMeta: { title: 'Квартира/Офис (работа)' } })),
    workEntrance: Heap.Optional(Heap.String({ customMeta: { title: 'Подъезд (работа)' } })),
    workFloor: Heap.Optional(Heap.String({ customMeta: { title: 'Этаж (работа)' } })),
    workIntercom: Heap.Optional(Heap.String({ customMeta: { title: 'Домофон (работа)' } })),
  },
  { customMeta: { title: 'Профили клиентов', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TV2TeoProfilesGauJn7 {
  export type T = typeof TV2TV2TeoProfilesGauJn7.T
  export type JsonT = typeof TV2TV2TeoProfilesGauJn7.JsonT
  export type PropsT = typeof TV2TV2TeoProfilesGauJn7.PropsT
  export type PatchT = typeof TV2TV2TeoProfilesGauJn7.PatchT
  export type CreateInputT = typeof TV2TV2TeoProfilesGauJn7.CreateInputT
}

export default TV2TV2TeoProfilesGauJn7

export type TV2TV2TeoProfilesGauJn7Row = TV2TV2TeoProfilesGauJn7.T
export type TV2TV2TeoProfilesGauJn7RowJson = TV2TV2TeoProfilesGauJn7.JsonT
