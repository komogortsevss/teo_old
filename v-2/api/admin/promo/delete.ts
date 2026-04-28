import PromoCodes from "../../../tables/promoCodes.table";
import PromoUsages from "../../../tables/promoUsages.table";
import { requireAccountRole } from "@app/auth";

interface DeletePromoRequest {
  id: string;
}

interface DeletePromoResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const apiAdminPromoDeleteRoute = app.post("/", async (ctx, req) => {
  requireAccountRole(ctx, "Staff");

  const body = req.body as DeletePromoRequest;

  if (!body.id) {
    return {
      success: false,
      error: "ID промокода обязателен",
    } as DeletePromoResponse;
  }

  const promoCode = await PromoCodes.findById(ctx, body.id);

  if (!promoCode) {
    return {
      success: false,
      error: "Промокод не найден",
    } as DeletePromoResponse;
  }

  try {
    const usages = await PromoUsages.findAll(ctx, {
      where: {
        promoCodeId: body.id,
      },
      limit: 1,
    });

    if (usages.length > 0) {
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
