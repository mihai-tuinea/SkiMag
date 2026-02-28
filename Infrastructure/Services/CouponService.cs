using System;
using Core.Entities;
using Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class CouponService(IConfiguration config) : ICouponService
{
    public async Task<AppCoupon?> GetCouponFromPromoCode(string code)
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];
        var promotionCodeService = new PromotionCodeService();

        var options = new PromotionCodeListOptions
        {
            Code = code.ToUpper(),
            Active = true,
            Expand = new List<string> { "data.promotion.coupon" }
        };

        var promotionCodes = await promotionCodeService.ListAsync(options);
        var promotionCode = promotionCodes.FirstOrDefault();

        if (promotionCode?.Promotion?.Coupon != null)
        {
            var coupon = promotionCode.Promotion.Coupon;

            return new AppCoupon
            {
                Name = coupon.Name,
                AmountOff = coupon.AmountOff,
                PercentOff = coupon.PercentOff,
                PromotionCode = promotionCode.Code,
                CouponId = coupon.Id
            };
        }

        return null;
    }
}