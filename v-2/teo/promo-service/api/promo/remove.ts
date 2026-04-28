import PromoCodes from "/v-2/tables/promoCodes.table";
import PromoUsages from "/v-2/tables/promoUsages.table";
import Orders from "/v-2/tables/orders.table";
import { Money } from "@app/heap";
import { captureCustomerEvent, ContactType } from "@crm/sdk";

interface RemoveRequest {
  orderId: string;
  customerId: string;
}

interface RemoveResponse {
  success: boolean;
  originalAmount: number;
  error?: string;
  errorCode?: string;
}

export const apiPromoRemoveRoute = app.post("/", async (ctx, req) => {
  const body = req.body as RemoveRequest;
  const { orderId, customerId } = body;

  if (!orderId) {
    return {
      success: false,
      originalAmount: 0,
      error: "Не указан ID заказа",
      errorCode: "MISSING_ORDER_ID",
    } as RemoveResponse;
  }

  if (!customerId) {
    return {
      success: false,
      originalAmount: 0,
      error: "Требуется авторизация",
      errorCode: "UNAUTHORIZED",
    } as RemoveResponse;
  }

  // Получаем заказ
  const order = await Orders.findById(ctx, orderId);

  if (!order) {
    return {
      success: false,
      originalAmount: 0,
      error: "Заказ не найден",
      errorCode: "ORDER_NOT_FOUND",
    } as RemoveResponse;
  }

  // Проверяем принадлежность заказа клиенту
  if (order.customerId.id !== customerId) {
    return {
      success: false,
      originalAmount: 0,
      error: "Доступ запрещён",
      errorCode: "FORBIDDEN",
    } as RemoveResponse;
  }

  // Проверяем, есть ли применённый промокод
  if (!order.promoCodeId) {
    return {
      success: false,
      originalAmount: order.subtotal?.amount || order.total?.amount || 0,
      error: "Промокод не применён к заказу",
      errorCode: "NO_PROMO_APPLIED",
    } as RemoveResponse;
  }

  const promoCodeId = order.promoCodeId.id;
  const promoCodeSnapshot = order.promoCode;

  // Восстанавливаем оригинальную сумму (subtotal + deliveryCost)
  const originalAmount =
    (order.subtotal?.amount || 0) + (order.deliveryCost?.amount || 0);

  // Обновляем запись об использовании
  const usage = await PromoUsages.findOneBy(ctx, {
    promoCodeId: promoCodeId,
    orderId: orderId,
    customerId: customerId,
    status: "applied",
  });

  if (usage) {
    await PromoUsages.update(ctx, {
      id: usage.id,
      status: "cancelled",
    });
  }

  // Уменьшаем счётчик использований промокода
  const promoCode = await PromoCodes.findById(ctx, promoCodeId);
  if (promoCode && promoCode.usageCount > 0) {
    await PromoCodes.update(ctx, {
      id: promoCodeId,
      usageCount: promoCode.usageCount - 1,
    });
  }

  // Обновляем заказ
  await Orders.update(ctx, {
    id: orderId,
    promoCodeId: null,
    promoCode: null,
    discountAmount: new Money(0, "RUB"),
    total: new Money(originalAmount, "RUB"),
  });

  // Отправляем событие об удалении промокода
  await captureCustomerEvent(ctx, {
    event: "promo_code_removed",
    customer: { displayName: "Unknown" },
    contacts: [{ type: ContactType.UserId, value: customerId }],
    metricEventData: {
      action_param1: customerId,
      action_param2: orderId,
      action_param3: promoCodeId,
    },
  }).catch(() => {});

  return {
    success: true,
    originalAmount,
  } as RemoveResponse;
});
