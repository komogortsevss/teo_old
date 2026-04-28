import PromoCodes from "../../../tables/promoCodes.table";
import { Money } from "@app/heap";
import { requireAccountRole } from "@app/auth";
import { normalizePromoCode } from "../../../shared/promo";

interface UpdatePromoRequest {
  id: string;
  code?: string;
  title?: string;
  discountType?: "fixed" | "percent";
  discountValue?: number;
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

interface UpdatePromoResponse {
  success: boolean;
  promoCode?: {
    id: string;
    code: string;
    title: string;
  };
  error?: string;
}

export const apiAdminPromoUpdateRoute = app.post("/", async (ctx, req) => {
  requireAccountRole(ctx, "Staff");

  const body = req.body as UpdatePromoRequest;

  if (!body.id) {
    return {
      success: false,
      error: "ID промокода обязателен",
    } as UpdatePromoResponse;
  }

  const promoCode = await PromoCodes.findById(ctx, body.id);

  if (!promoCode) {
    return {
      success: false,
      error: "Промокод не найден",
    } as UpdatePromoResponse;
  }

  const updates: any = {};

  if (body.code !== undefined) {
    const normalizedCode = normalizePromoCode(body.code);

    if (!normalizedCode) {
      return {
        success: false,
        error: "Код промокода не может быть пустым",
      } as UpdatePromoResponse;
    }

    if (normalizedCode !== promoCode.code) {
      const existingPromo = await PromoCodes.findOneBy(ctx, {
        code: normalizedCode,
      });

      if (existingPromo) {
        return {
          success: false,
          error: "Промокод с таким кодом уже существует",
        } as UpdatePromoResponse;
      }
    }

    updates.code = normalizedCode;
  }

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      return {
        success: false,
        error: "Название промокода не может быть пустым",
      } as UpdatePromoResponse;
    }
    updates.title = body.title.trim();
  }

  if (body.discountType !== undefined) {
    if (!["fixed", "percent"].includes(body.discountType)) {
      return {
        success: false,
        error: "Тип скидки должен быть 'fixed' или 'percent'",
      } as UpdatePromoResponse;
    }
    updates.discountType = body.discountType;
  }

  if (body.discountValue !== undefined) {
    if (body.discountValue < 0) {
      return {
        success: false,
        error: "Значение скидки должно быть неотрицательным числом",
      } as UpdatePromoResponse;
    }
    updates.discountValue = new Money(body.discountValue, "RUB");
  }

  if (body.minOrderAmount !== undefined) {
    updates.minOrderAmount = body.minOrderAmount
      ? new Money(body.minOrderAmount, "RUB")
      : null;
  }

  if (body.maxDiscount !== undefined) {
    updates.maxDiscount = body.maxDiscount
      ? new Money(body.maxDiscount, "RUB")
      : null;
  }

  if (body.usageLimit !== undefined) {
    updates.usageLimit = body.usageLimit;
  }

  if (body.startAt !== undefined) {
    updates.startAt = body.startAt ? new Date(body.startAt) : null;
  }
  if (body.endAt !== undefined) {
    updates.endAt = body.endAt ? new Date(body.endAt) : null;
  }

  if (body.isSingleUse !== undefined) {
    updates.isSingleUse = body.isSingleUse;
  }
  if (body.isActive !== undefined) {
    updates.isActive = body.isActive;
  }

  if (body.allowedProducts !== undefined) {
    updates.allowedProducts = body.allowedProducts
      ? JSON.stringify(body.allowedProducts)
      : null;
  }
  if (body.excludedProducts !== undefined) {
    updates.excludedProducts = body.excludedProducts
      ? JSON.stringify(body.excludedProducts)
      : null;
  }

  try {
    const updatedPromo = await PromoCodes.update(ctx, {
      id: body.id,
      ...updates,
    });

    return {
      success: true,
      promoCode: {
        id: updatedPromo.id,
        code: updatedPromo.code,
        title: updatedPromo.title,
      },
    } as UpdatePromoResponse;
  } catch (error) {
    return {
      success: false,
      error: "Ошибка при обновлении промокода: " + String(error),
    } as UpdatePromoResponse;
  }
});
