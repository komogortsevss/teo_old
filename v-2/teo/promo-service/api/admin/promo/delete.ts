import PromoCodes from "../../../../../tables/promoCodes.table";
import PromoUsages from "../../../../../tables/promoUsages.table";
import { requireAccountRole } from "@app/auth";

interface DeletePromoRequest {
  id: string;
}

interface DeletePromoResponse {
  success: boolean;
  error?: string;
}

export const apiAdminPromoDeleteRoute = app.post("/", async (ctx, req) => {
  // Проверяем права (только Staff/Admin)
  requireAccountRole(ctx, "Staff");

  const body = req.body as DeletePromoRequest;

  if (!body.id) {
    return {
      success: false,
      error: "ID промокода обязателен",
    } as DeletePromoResponse;
  }

  // Находим промокод
  const promoCode = await PromoCodes.findById(ctx, body.id);

  if (!promoCode) {
    return {
      success: false,
      error: "Промокод не найден",
    } as DeletePromoResponse;
  }

  try {
    // Проверяем, есть ли использования промокода
    const usages = await PromoUsages.findAll(ctx, {
      where: {
        promoCodeId: body.id,
      },
      limit: 1,
    });

    if (usages.length > 0) {
      // Если есть использования, просто деактивируем
      await PromoCodes.update(ctx, {
        id: body.id,
        isActive: false,
      });

      return {
        success: true,
        message:
          "Промокод деактивирован (нельзя удалить, так как есть использования)",
      } as DeletePromoResponse;
    }

    // Удаляем промокод
    await PromoCodes.delete(ctx, body.id);

    return {
      success: true,
    } as DeletePromoResponse;
  } catch (error) {
    return {
      success: false,
      error: "Ошибка при удалении промокода: " + String(error),
    } as DeletePromoResponse;
  }
});
