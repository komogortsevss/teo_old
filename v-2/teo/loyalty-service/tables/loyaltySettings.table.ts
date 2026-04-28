// This file is auto-generated via createOrUpdateHeapTableFile API and should not be edited manually
import { Heap } from '@app/heap'

export const TV2TeoLoyaltySettingsOHj = Heap.Table(
  't_v_2_teo_loyaltySettings_oHj',
  {
    isActive: Heap.Optional(Heap.Boolean({ customMeta: { title: 'Система активна' } })),
    earnPercent: Heap.Optional(Heap.Number({ customMeta: { title: 'Процент начисления бонусов' } })),
    maxSpendPercent: Heap.Optional(Heap.Number({ customMeta: { title: 'Максимальный процент списания' } })),
    bonusLifetimeDays: Heap.Optional(Heap.Number({ customMeta: { title: 'Срок жизни бонусов (дней)' } })),
    minOrderAmountForEarn: Heap.Optional(
      Heap.Money({ customMeta: { title: 'Минимальная сумма заказа для начисления' } }),
    ),
    minBonusForSpend: Heap.Optional(Heap.Number({ customMeta: { title: 'Минимум бонусов для списания' } })),
    welcomeBonus: Heap.Optional(Heap.Number({ customMeta: { title: 'Приветственный бонус' } })),
  },
  { customMeta: { title: 'Настройки лояльности', description: '' } },
)

// declaration merging: allows using table-related types via default import
export declare namespace TV2TeoLoyaltySettingsOHj {
  export type T = typeof TV2TeoLoyaltySettingsOHj.T
  export type JsonT = typeof TV2TeoLoyaltySettingsOHj.JsonT
  export type PropsT = typeof TV2TeoLoyaltySettingsOHj.PropsT
  export type PatchT = typeof TV2TeoLoyaltySettingsOHj.PatchT
  export type CreateInputT = typeof TV2TeoLoyaltySettingsOHj.CreateInputT
}

export default TV2TeoLoyaltySettingsOHj

export type TV2TeoLoyaltySettingsOHjRow = TV2TeoLoyaltySettingsOHj.T
export type TV2TeoLoyaltySettingsOHjRowJson = TV2TeoLoyaltySettingsOHj.JsonT
