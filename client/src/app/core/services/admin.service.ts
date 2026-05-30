import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderParams } from '../../shared/models/orderParams';
import { Pagination } from '../../shared/models/pagination';
import { Order } from '../../shared/models/order';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getProducts(shopParams: ShopParams) {
    let params = new HttpParams();
    if (shopParams.search) params = params.append('search', shopParams.search);
    params = params.append('pageSize', shopParams.pageSize);
    params = params.append('pageIndex', shopParams.pageNumber);
    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', { params });
  }

  createProduct(product: Partial<Product>) {
    return this.http.post<Product>(this.baseUrl + 'products', product);
  }

  updateProduct(id: number, product: Product) {
    return this.http.put<void>(this.baseUrl + 'products/' + id, product);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(this.baseUrl + 'products/' + id);
  }

  getOrders(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('status', orderParams.filter);
    }
    params = params.append('pageIndex', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);

    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', { params });
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});
  }
}
