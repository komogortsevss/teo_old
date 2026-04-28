import PromoCodes from "/v-2/tables/promoCodes.table";
import PromoUsages from "/v-2/tables/promoUsages.table";
import Orders from "/v-2/tables/orders.table";
import { Money } from "@app/heap";
import { captureCustomerEvent, ContactType } from "@crm/sdk";
import {
  normalizePromoCode,
  calculateDiscount,
  type CartItem,
} from "../../shared/promo";

interface ApplyRequest {
  code: string;
  orderId: string;
  cartAmount: number;
  customerId: string;
  items?: CartItem[];
}

interface ApplyResponse {
  success: boolean;
  usageId?: string;
  discountAmount: number;
  finalAmount: number;
  error?: string;
  errorCode?: string;
}

export const apiPromoApplyRoute = app.post("/", async (ctx, req) => {
  const body = req.body as ApplyRequest;
  const { code, orderId, cartAmount, customerId, items } = body;

  const normalizedCode = normalizePromoCode(code || "");

  if (!normalizedCode) {
    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount || 0,
      error: "Введите промокод",
      errorCode: "EMPTY_CODE",
    } as ApplyResponse;
  }

  if (!orderId) {
    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount || 0,
      error: "Не указан ID заказа",
      errorCode: "MISSING_ORDER_ID",
    } as ApplyResponse;
  }

  if (!customerId) {
    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount || 0,
      error: "Требуется авторизация для применения промокода",
      errorCode: "UNAUTHORIZED",
    } as ApplyResponse;
  }

  if (!cartAmount || cartAmount <= 0) {
    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount || 0,
      error: "Некорректная сумма корзины",
      errorCode: "INVALID_AMOUNT",
    } as ApplyResponse;
  }

  // Ищем промокод
  const promoCode = await PromoCodes.findOneBy(ctx, {
    code: normalizedCode,
  });

  if (!promoCode) {
    // Отправляем событие о невалидном промокоде
    await captureCustomerEvent(ctx, {
      event: "promo_code_invalid",
      customer: { displayName: "Unknown" },
      contacts: [{ type: ContactType.UserId, value: customerId }],
      metricEventData: {
        action_param1: customerId,
        action_param2: normalizedCode,
        action_param3: "NOT_FOUND",
        action_param1_float: cartAmount,
      },
    }).catch(() => {});

    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount,
      error: "Промокод не найден",
      errorCode: "NOT_FOUND",
    } as ApplyResponse;
  }

  // Проверяем активность
  if (!promoCode.isActive) {
    await captureCustomerEvent(ctx, {
      event: "promo_code_invalid",
      customer: { displayName: "Unknown" },
      contacts: [{ type: ContactType.UserId, value: customerId }],
      metricEventData: {
        action_param1: customerId,
        action_param2: normalizedCode,
        action_param3: "INACTIVE",
        action_param1_float: cartAmount,
      },
    }).catch(() => {});

    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount,
      error: "Промокод неактивен",
      errorCode: "INACTIVE",
    } as ApplyResponse;
  }

  // Проверяем срок действия
  const now = new Date();
  if (promoCode.startAt && now < new Date(promoCode.startAt)) {
    await captureCustomerEvent(ctx, {
      event: "promo_code_invalid",
      customer: { displayName: "Unknown" },
      contacts: [{ type: ContactType.UserId, value: customerId }],
      metricEventData: {
        action_param1: customerId,
        action_param2: normalizedCode,
        action_param3: "NOT_STARTED",
        action_param1_float: cartAmount,
      },
    }).catch(() => {});

    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount,
      error: "Промокод ещё не действует",
      errorCode: "NOT_STARTED",
    } as ApplyResponse;
  }
  if (promoCode.endAt && now > new Date(promoCode.endAt)) {
    await captureCustomerEvent(ctx, {
      event: "promo_code_invalid",
      customer: { displayName: "Unknown" },
      contacts: [{ type: ContactType.UserId, value: customerId }],
      metricEventData: {
        action_param1: customerId,
        action_param2: normalizedCode,
        action_param3: "EXPIRED",
        action_param1_float: cartAmount,
      },
    }).catch(() => {});

    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount,
      error: "Срок действия промокода истёк",
      errorCode: "EXPIRED",
    } as ApplyResponse;
  }

  // Проверяем минимальную сумму заказа
  if (promoCode.minOrderAmount && promoCode.minOrderAmount.amount > 0) {
    if (cartAmount < promoCode.minOrderAmount.amount) {
      await captureCustomerEvent(ctx, {
        event: "promo_code_invalid",
        customer: { displayName: "Unknown" },
        contacts: [{ type: ContactType.UserId, value: customerId }],
        metricEventData: {
          action_param1: customerId,
          action_param2: normalizedCode,
          action_param3: "MIN_AMOUNT",
          action_param1_float: cartAmount,
        },
      }).catch(() => {});

      return {
        success: false,
        discountAmount: 0,
        finalAmount: cartAmount,
        error: `Минимальная сумма заказа для применения промокода: ${promoCode.minOrderAmount.amount} ₽`,
        errorCode: "MIN_AMOUNT",
      } as ApplyResponse;
    }
  }

  // Проверяем лимит использований
  if (promoCode.usageLimit > 0 && promoCode.usageCount >= promoCode.usageLimit) {
    await captureCustomerEvent(ctx, {
      event: "promo_code_invalid",
      customer: { displayName: "Unknown" },
      contacts: [{ type: ContactType.UserId, value: customerId }],
      metricEventData: {
        action_param1: customerId,
        action_param2: normalizedCode,
        action_param3: "USAGE_LIMIT",
        action_param1_float: cartAmount,
      },
    }).catch(() => {});

    return {
      success: false,
      discountAmount: 0,
      finalAmount: cartAmount,
      error: "Лимит использований промокода исчерпан",
      errorCode: "USAGE_LIMIT",
    } as ApplyResponse;
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
          success: false,
          discountAmount: 0,
          finalAmount: cartAmount,
          error: "Промокод не применим к товарам в корзине",
          errorCode: "NOT_APPLICABLE",
        } as ApplyResponse;
      }
    }

    if (excludedProducts && excludedProducts.length > 0) {
      const hasExcludedItem = items.some((item) =>
        excludedProducts.includes(item.id)
      );
      if (hasExcludedItem) {
        return {
          success: false,
          discountAmount: 0,
          finalAmount: cartAmount,
          error: "Промокод не применим к некоторым товарам в корзине",
          errorCode: "EXCLUDED_PRODUCTS",
        } as ApplyResponse;
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
      await captureCustomerEvent(ctx, {
        event: "promo_code_invalid",
        customer: { displayName: "Unknown" },
        contacts: [{ type: ContactType.UserId, value: customerId }],
        metricEventData: {
          action_param1: customerId,
          action_param2: normalizedCode,
          action_param3: "ALREADY_USED",
          action_param1_float: cartAmount,
        },
      }).catch(() => {});

      return {
        success: false,
        discountAmount: 0,
        finalAmount: cartAmount,
        error: "Вы уже использовали этот промокод",
        errorCode: "ALREADY_USED",
      } as ApplyResponse;
    }
  }

  // Рассчитываем скидку
  const { discountAmount, finalAmount } = calculateDiscount(
    promoCode.discountType as "fixed" | "percent",
    promoCode.discountValue.amount,
    cartAmount,
    promoCode.maxDiscount?.amount
  );

  // Создаём запись об использовании
  const usage = await PromoUsages.create(ctx, {
    promoCodeId: promoCode.id,
    customerId: customerId,
    orderId: orderId,
    originalAmount: new Money(cartAmount, "RUB"),
    discountAmount: new Money(discountAmount, "RUB"),
    finalAmount: new Money(finalAmount, "RUB"),
    appliedAt: new Date(),
    status: "applied",
  });

  // Увеличиваем счётчик использований
  await PromoCodes.update(ctx, {
    id: promoCode.id,
    usageCount: promoCode.usageCount + 1,
  });

  // Обновляем заказ
  await Orders.update(ctx, {
    id: orderId,
    promoCodeId: promoCode.id,
    promoCode: promoCode.code,
    discountAmount: new Money(discountAmount, "RUB"),
    total: new Money(finalAmount, "RUB"),
  });

  // Отправляем событие о применении промокода
  await captureCustomerEvent(ctx, {
    event: "promo_code_applied",
    customer: { displayName: "Unknown" },
    contacts: [{ type: ContactType.UserId, value: customerId }],
    metricEventData: {
      action_param1: customerId,
      action_param2: orderId,
      action_param3: promoCode.id,
      action_param1_float: cartAmount,
      action_param2_float: discountAmount,
      action_param3_float: finalAmount,
      action_param1_mapstrstr: {
        code: promoCode.code,
        discountType: promoCode.discountType,
      },
    },
  }).catch(() => {});

  return {
    success: true,
    usageId: usage.id,
    discountAmount,
    finalAmount,
  } as ApplyResponse;
});
