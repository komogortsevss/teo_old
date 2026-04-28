import PromoCodes from "/v-2/tables/promoCodes.table";
import { Money } from "@app/heap";
import { requireAccountRole } from "@app/auth";
import { normalizePromoCode } from "../../../shared/promo";

interface CreatePromoRequest {
  code: string;
  title: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startAt?: string;
  endAt?: string;
  isSingleUse?: boolean;
  isActive?: boolean;
  allowedProducts?: string[];
  excludedProducts?: string[];
}

interface CreatePromoResponse {
  success: boolean;
  promoCode?: {
    id: string;
    code: string;
    title: string;
  };
  error?: string;
}

export const apiAdminPromoCreateRoute = app.post("/", async (ctx, req) => {
  // Проверяем права (только Staff/Admin)
  requireAccountRole(ctx, "Staff");

  const body = req.body as CreatePromoRequest;

  // Валидация обязательных полей
  if (!body.code || !body.code.trim()) {
    return {
      success: false,
      error: "Код промокода обязателен",
    } as CreatePromoResponse;
  }

  if (!body.title || !body.title.trim()) {
    return {
      success: false,
      error: "Название промокода обязательно",
    } as CreatePromoResponse;
  }

  if (!body.discountType || !["fixed", "percent"].includes(body.discountType)) {
    return {
      success: false,
      error: "Тип скидки должен быть 'fixed' или 'percent'",
    } as CreatePromoResponse;
  }

  if (body.discountValue === undefined || body.discountValue < 0) {
    return {
      success: false,
      error: "Значение скидки должно быть неотрицательным числом",
    } as CreatePromoResponse;
  }

  const normalizedCode = normalizePromoCode(body.code);

  // Проверяем уникальность кода
  const existingPromo = await PromoCodes.findOneBy(ctx, {
    code: normalizedCode,
  });

  if (existingPromo) {
    return {
      success: false,
      error: "Промокод с таким кодом уже существует",
    } as CreatePromoResponse;
  }

  try {
    // Создаём промокод
    const promoCode = await PromoCodes.create(ctx, {
      code: normalizedCode,
      title: body.title.trim(),
      discountType: body.discountType,
      discountValue: new Money(body.discountValue, "RUB"),
      minOrderAmount: body.minOrderAmount
        ? new Money(body.minOrderAmount, "RUB")
        : null,
      maxDiscount: body.maxDiscount
        ? new Money(body.maxDiscount, "RUB")
        : null,
      usageLimit: body.usageLimit || 0,
      usageCount: 0,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
      isSingleUse: body.isSingleUse || false,
      isActive: body.isActive !== undefined ? body.isActive : true,
      allowedProducts: body.allowedProducts
        ? JSON.stringify(body.allowedProducts)
        : null,
      excludedProducts: body.excludedProducts
        ? JSON.stringify(body.excludedProducts)
        : null,
    });

    return {
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        title: promoCode.title,
      },
    } as CreatePromoResponse;
  } catch (error) {
    return {
      success: false,
      error: "Ошибка при создании промокода: " + String(error),
    } as CreatePromoResponse;
  }
});
