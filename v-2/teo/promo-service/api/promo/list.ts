import PromoCodes from "../../../../tables/promoCodes.table";
import { requireAccountRole } from "@app/auth";

interface PromoListItem {
  id: string;
  code: string;
  title: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  usageCount: number;
  usageLimit: number;
  startAt?: string;
  endAt?: string;
  isSingleUse: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  promos: PromoListItem[];
  total: number;
}

export const apiPromoListRoute = app.get("/", async (ctx, req) => {
  // Проверяем права (только Staff/Admin)
  requireAccountRole(ctx, "Staff");

  // Получаем все промокоды
  const promoCodes = await PromoCodes.findAll(ctx, {
    order: [{ createdAt: "desc" }],
    limit: 1000,
  });

  const promos: PromoListItem[] = promoCodes.map((promo) => ({
    id: promo.id,
    code: promo.code,
    title: promo.title,
    discountType: promo.discountType as "fixed" | "percent",
    discountValue: promo.discountValue?.amount || 0,
    minOrderAmount: promo.minOrderAmount?.amount,
    maxDiscount: promo.maxDiscount?.amount,
    isActive: promo.isActive,
    usageCount: promo.usageCount || 0,
    usageLimit: promo.usageLimit || 0,
    startAt: promo.startAt?.toISOString(),
    endAt: promo.endAt?.toISOString(),
    isSingleUse: promo.isSingleUse,
    createdAt: promo.createdAt.toISOString(),
    updatedAt: promo.updatedAt.toISOString(),
  }));

  return {
    promos,
    total: promos.length,
  } as ListResponse;
});
