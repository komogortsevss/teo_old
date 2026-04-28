import PromoCodes from "../../../../tables/promoCodes.table";
import PromoUsages from "../../../../tables/promoUsages.table";
import {
  normalizePromoCode,
  calculateDiscount,
  type CartItem,
} from "../../shared/promo";

interface ValidateRequest {
  code: string;
  cartAmount: number;
  customerId?: string;
  items?: CartItem[];
}

interface ValidateResponse {
  valid: boolean;
  promoCode?: {
    id: string;
    code: string;
    title: string;
    discountType: "fixed" | "percent";
    discountValue: number;
  };
  discountAmount?: number;
  finalAmount: number;
  error?: string;
  errorCode?: string;
}

export const apiPromoValidateRoute = app.post("/", async (ctx, req) => {
  const body = req.body as ValidateRequest;
  const { code, cartAmount, customerId, items } = body;

  const normalizedCode = normalizePromoCode(code || "");

  if (!normalizedCode) {
    return {
      valid: false,
      finalAmount: cartAmount || 0,
      error: "Введите промокод",
      errorCode: "EMPTY_CODE",
    } as ValidateResponse;
  }

  if (!cartAmount || cartAmount <= 0) {
    return {
      valid: false,
      finalAmount: cartAmount || 0,
      error: "Некорректная сумма корзины",
      errorCode: "INVALID_AMOUNT",
    } as ValidateResponse;
  }

  // Ищем промокод
  const promoCode = await PromoCodes.findOneBy(ctx, {
    code: normalizedCode,
  });

  if (!promoCode) {
    return {
      valid: false,
      finalAmount: cartAmount,
      error: "Промокод не найден",
      errorCode: "NOT_FOUND",
    } as ValidateResponse;
  }

  // Проверяем активность
  if (!promoCode.isActive) {
    return {
      valid: false,
      finalAmount: cartAmount,
      error: "Промокод неактивен",
      errorCode: "INACTIVE",
    } as ValidateResponse;
  }

  // Проверяем срок действия
  const now = new Date();
  if (promoCode.startAt && now < new Date(promoCode.startAt)) {
    return {
      valid: false,
      finalAmount: cartAmount,
      error: "Промокод ещё не действует",
      errorCode: "NOT_STARTED",
    } as ValidateResponse;
  }
  if (promoCode.endAt && now > new Date(promoCode.endAt)) {
    return {
      valid: false,
      finalAmount: cartAmount,
      error: "Срок действия промокода истёк",
      errorCode: "EXPIRED",
    } as ValidateResponse;
  }

  // Проверяем минимальную сумму заказа
  if (promoCode.minOrderAmount && promoCode.minOrderAmount.amount > 0) {
    if (cartAmount < promoCode.minOrderAmount.amount) {
      return {
        valid: false,
        finalAmount: cartAmount,
        error: `Минимальная сумма заказа для применения промокода: ${promoCode.minOrderAmount.amount} ₽`,
        errorCode: "MIN_AMOUNT",
      } as ValidateResponse;
    }
  }

  // Проверяем лимит использований
  if (promoCode.usageLimit > 0 && promoCode.usageCount >= promoCode.usageLimit) {
    return {
      valid: false,
      finalAmount: cartAmount,
      error: "Лимит использований промокода исчерпан",
      errorCode: "USAGE_LIMIT",
    } as ValidateResponse;
  }

  // Проверяем применимость к товарам
  if (items && items.length > 0) {
    const allowedProducts = promoCode.allowedProducts
      ? JSON.parse(promoCode.allowedProducts)
      : null;
    const excludedProducts = promoCode.excludedProducts
      ? JSON.parse(promoCode.excludedProducts)
      : null;

    if (allowedProducts && allowedProducts.length > 0) {
      const hasAllowedItem = items.some((item) =>
        allowedProducts.includes(item.id)
      );
      if (!hasAllowedItem) {
        return {
          valid: false,
          finalAmount: cartAmount,
          error: "Промокод не применим к товарам в корзине",
          errorCode: "NOT_APPLICABLE",
        } as ValidateResponse;
      }
    }

    if (excludedProducts && excludedProducts.length > 0) {
      const hasExcludedItem = items.some((item) =>
        excludedProducts.includes(item.id)
      );
      if (hasExcludedItem) {
        return {
          valid: false,
          finalAmount: cartAmount,
          error: "Промокод не применим к некоторым товарам в корзине",
          errorCode: "EXCLUDED_PRODUCTS",
        } as ValidateResponse;
      }
    }
  }

  // Проверяем одноразовость
  if (promoCode.isSingleUse && customerId) {
    const existingUsage = await PromoUsages.findOneBy(ctx, {
      promoCodeId: promoCode.id,
      customerId: customerId,
      status: "applied",
    });

    if (existingUsage) {
      return {
        valid: false,
        finalAmount: cartAmount,
        error: "Вы уже использовали этот промокод",
        errorCode: "ALREADY_USED",
      } as ValidateResponse;
    }
  }

  // Рассчитываем скидку
  const { discountAmount, finalAmount } = calculateDiscount(
    promoCode.discountType as "fixed" | "percent",
    promoCode.discountValue.amount,
    cartAmount,
    promoCode.maxDiscount?.amount
  );

  return {
    valid: true,
    promoCode: {
      id: promoCode.id,
      code: promoCode.code,
      title: promoCode.title,
      discountType: promoCode.discountType as "fixed" | "percent",
      discountValue: promoCode.discountValue.amount,
    },
    discountAmount,
    finalAmount,
  } as ValidateResponse;
});
