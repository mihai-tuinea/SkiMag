import { Component, inject, OnInit } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Order } from '../../shared/models/order';
import { AdminService } from '../../core/services/admin.service';
import { OrderParams } from '../../shared/models/orderParams';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatLabel, MatSelectModule } from '@angular/material/select';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';
import { SnackbarService } from '../../core/services/snackbar.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIcon,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
    MatLabel,
    MatTooltipModule,
    MatTabsModule,
    RouterLink,
    MatIconButton,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  // Orders
  displayedColumns: string[] = ['id', 'buyerEmail', 'orderDate', 'total', 'status', 'action'];
  dataSource = new MatTableDataSource<Order>([]);
  orderParams = new OrderParams();
  totalItems = 0;
  statusOptions = ['All', 'PaymentReceived', 'PaymentMismatch', 'Refunded', 'Pending'];

  // Catalog
  productColumns: string[] = ['id', 'pictureUrl', 'name', 'brand', 'type', 'price', 'stock', 'action'];
  productDataSource = new MatTableDataSource<Product>([]);
  shopParams = new ShopParams();
  totalProducts = 0;
  productSearch = '';

  private adminService = inject(AdminService);
  private dialogService = inject(DialogService);
  private dialog = inject(MatDialog);
  private snackbar = inject(SnackbarService);

  ngOnInit(): void {
    this.loardOrders();
    this.loadProducts();
  }

  // --- Orders ---

  loardOrders() {
    this.adminService.getOrders(this.orderParams).subscribe({
      next: (response) => {
        if (response.data) {
          this.dataSource.data = response.data;
          this.totalItems = response.count;
        }
      },
    });
  }

  onPageChange(event: any) {
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loardOrders();
  }

  onFilterSelect(event: any) {
    this.orderParams.filter = event.value;
    this.orderParams.pageNumber = 1;
    this.loardOrders();
  }

  async openConfirmDialog(id: number) {
    const confirmed = await this.dialogService.confirm(
      'Confirm refund',
      'Are you sure you want to issue this refund? This cannot be undone.',
    );

    if (confirmed) this.refundOrder(id);
  }

  refundOrder(id: number) {
    this.adminService.refundOrder(id).subscribe({
      next: (order) =>
        (this.dataSource.data = this.dataSource.data.map((o) => (o.id === id ? order : o))),
    });
  }

  // --- Catalog ---

  loadProducts() {
    this.adminService.getProducts(this.shopParams).subscribe({
      next: (response) => {
        if (response.data) {
          this.productDataSource.data = response.data;
          this.totalProducts = response.count;
        }
      },
    });
  }

  onProductPageChange(event: any) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.loadProducts();
  }

  onProductSearch() {
    this.shopParams.search = this.productSearch;
    this.shopParams.pageNumber = 1;
    this.loadProducts();
  }

  openCreateProduct() {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.adminService.createProduct(result).subscribe({
        next: () => {
          this.snackbar.success('Product created successfully');
          this.loadProducts();
        },
        error: () => this.snackbar.error('Failed to create product'),
      });
    });
  }

  openEditProduct(product: Product) {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: { product },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.adminService.updateProduct(product.id, result as Product).subscribe({
        next: () => {
          this.productDataSource.data = this.productDataSource.data.map((p) =>
            p.id === product.id ? { ...product, ...result } : p,
          );
          this.snackbar.success('Product updated successfully');
        },
        error: () => this.snackbar.error('Failed to update product'),
      });
    });
  }

  async openDeleteProduct(id: number) {
    const confirmed = await this.dialogService.confirm(
      'Delete Product',
      'Are you sure you want to delete this product? This cannot be undone.',
    );

    if (!confirmed) return;

    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.productDataSource.data = this.productDataSource.data.filter((p) => p.id !== id);
        this.totalProducts--;
        this.snackbar.success('Product deleted');
      },
      error: () => this.snackbar.error('Failed to delete product'),
    });
  }
}
