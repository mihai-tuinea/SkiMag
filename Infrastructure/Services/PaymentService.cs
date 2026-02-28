using System;
using Core.Entities;
using Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class PaymentService(IConfiguration config, ICartService cartService,
    IUnitOfWork unit) : IPaymentService
{
    public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];

        var cart = await cartService.GetCartAsync(cartId)
            ?? throw new Exception("Cart not found in Redis");

        var shippingPrice = await GetShippingPriceAsync(cart) ?? 0m;

        await ValidateCartItemsInCartAsync(cart);

        var subtotal = CalculateSubtotal(cart);

        if (cart.Coupon != null)
        {
            subtotal = await ApplyDiscountAsync(cart.Coupon, subtotal);
        }

        var total = subtotal + shippingPrice;

        await CreateUpdatePaymentIntentAsync(cart, total);

        await cartService.SetCartAsync(cart);

        return cart;
    }

    private async Task CreateUpdatePaymentIntentAsync(ShoppingCart cart, decimal total)
    {
        var service = new PaymentIntentService();

        if (string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)Math.Round(total * 100),
                Currency = "usd",
                PaymentMethodTypes = ["card"]
            };
            PaymentIntent intent = await service.CreateAsync(options);
            cart.PaymentIntentId = intent.Id;
            cart.ClientSecret = intent.ClientSecret;
        }
        else
        {
            var intent = await service.GetAsync(cart.PaymentIntentId);

            if (intent.Status != "succeeded")
            {
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = (long)Math.Round(total * 100),
                };
                await service.UpdateAsync(cart.PaymentIntentId, options);
            }
        }
    }

    private async Task<decimal> ApplyDiscountAsync(AppCoupon appCoupon,
        decimal amount)
    {
        var couponService = new Stripe.CouponService();

        var coupon = await couponService.GetAsync(appCoupon.CouponId);

        if (coupon.AmountOff.HasValue)
        {
            amount -= coupon.AmountOff.Value / 100;
            amount = Math.Max(0, amount);
        }
        else if (coupon.PercentOff.HasValue)
        {
            var discount = amount * (coupon.PercentOff.Value / 100);
            amount -= discount;
        }

        return amount;
    }

    private decimal CalculateSubtotal(ShoppingCart cart)
        => cart.Items.Sum(item => item.Price * item.Quantity);

    private async Task ValidateCartItemsInCartAsync(ShoppingCart cart)
    {
        foreach (var item in cart.Items)
        {
            var productItem = await unit.Repository<Core.Entities.Product>().GetByIdAsync(item.ProductId)
                ?? throw new Exception($"Product {item.ProductId} not found in DB");

            if (item.Price != productItem.Price)
                item.Price = productItem.Price;
        }
    }

    private async Task<decimal?> GetShippingPriceAsync(ShoppingCart cart)
    {
        if (cart.DeliveryMethodId.HasValue)
        {
            var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync((int)cart.DeliveryMethodId)
                ?? throw new Exception("Delivery method not found in DB");

            return deliveryMethod.Price;
        }

        return null;
    }
}