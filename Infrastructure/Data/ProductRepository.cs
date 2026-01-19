using System;
using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class ProductRepository(StoreContext context) : IProductRepository
{
    public void AddProduct(Product product)
    {
        context.Products.Add(product);
    }

    public void DeleteProduct(Product product)
    {
        context.Products.Remove(product);
    }

    public async Task<IReadOnlyList<string>> GetProductBrandsAsync()
    {
        return await context.Products
            .Select(p => p.Brand)
            .Distinct()
            .ToListAsync();
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await context.Products.FindAsync(id);
    }

    public async Task<IReadOnlyList<Product>> GetProductsAsync(string? brand, string? type, string? sort)
    {
        var query = context.Products.AsQueryable();

        if (!String.IsNullOrWhiteSpace(brand))
        {
            query = query.Where(x => x.Brand == brand);
        }

        if (!String.IsNullOrWhiteSpace(type))
        {
            query = query.Where(x => x.Type == type);
        }


        switch (sort)
        {
            case "priceAsc":
                query = query.OrderBy(x => x.Price);
                break;
            case "priceDesc":
                query = query.OrderByDescending(x => x.Price);
                break;
            default:
                query.OrderBy(x => x.Name);
                break;
        }


        return await query.ToListAsync();
    }

    public async Task<IReadOnlyList<string>> GetProductTypesAsync()
    {
        return await context.Products
            .Select(p => p.Type)
            .Distinct()
            .ToListAsync();
    }

    public bool ProductExists(int id)
    {
        return context.Products.Any(x => x.Id == id);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void UpdateProduct(Product product)
    {
        context.Entry(product).State = EntityState.Modified;
    }
}
