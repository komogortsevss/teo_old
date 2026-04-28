// @shared

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ValidatePromoInput {
  code: string;
  cartAmount: number;
  customerId?: string;
  items?: CartItem[];
}

export interface ApplyPromoInput {
  code: string;
  orderId: string;
  cartAmount: number;
  customerId: string;
  items?: CartItem[];
}

export interface PromoCodeDto {
  id: string;
  code: string;
  title: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
}

export interface PromoValidationResult {
  valid: boolean;
  promoCode?: PromoCodeDto;
  discountAmount?: number;
  finalAmount: number;
  error?: string;
  errorCode?: string;
}

export interface PromoApplyResult {
  success: boolean;
  usageId?: string;
  discountAmount: number;
  finalAmount: number;
  error?: string;
}

export interface PromoListItem {
  id: string;
  code: string;
  title: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  isActive: boolean;
  usageCount: number;
  usageLimit: number;
  startAt?: Date;
  endAt?: Date;
}

/**
 * Нормализует код промокода (uppercase, trim)
 */
export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Рассчитывает сумму скидки
 */
export function calculateDiscount(
  discountType: "fixed" | "percent",
  discountValue: number,
  cartAmount: number,
  maxDiscount?: number
): { discountAmount: number; finalAmount: number } {
  let discountAmount: number;

  if (discountType === "fixed") {
    discountAmount = discountValue;
  } else if (discountType === "percent") {
    const percentValue = discountValue / 100;
    discountAmount = cartAmount * percentValue;

    // Проверяем максимальную скидку
    if (maxDiscount && maxDiscount > 0) {
      if (discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    }
  } else {
    discountAmount = 0;
  }

  // Скидка не может быть больше суммы корзины
  if (discountAmount > cartAmount) {
    discountAmount = cartAmount;
  }

  const finalAmount = Math.max(0, cartAmount - discountAmount);

  return {
    discountAmount,
    finalAmount,
  };
}
