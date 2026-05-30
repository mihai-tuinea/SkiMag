import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Product } from '../../../shared/models/product';

@Component({
  selector: 'app-product-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './product-form-dialog.component.html',
})
export class ProductFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  data: { product?: Product } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    pictureUrl: [''],
    type: ['', Validators.required],
    brand: ['', Validators.required],
    quantityInStock: [0, [Validators.required, Validators.min(0)]],
  });

  get isEdit() {
    return !!this.data?.product;
  }

  ngOnInit() {
    if (this.data?.product) {
      this.form.patchValue(this.data.product);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const value = this.form.value;
    const result: Partial<Product> = {
      ...(this.isEdit ? { id: this.data.product!.id } : {}),
      name: value.name!,
      description: value.description!,
      price: Number(value.price),
      pictureUrl: value.pictureUrl || '/images/placeholder.png',
      type: value.type!,
      brand: value.brand!,
      quantityInStock: Number(value.quantityInStock),
    };
    this.dialogRef.close(result);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
