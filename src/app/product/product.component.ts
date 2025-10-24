import { Component, OnInit } from '@angular/core';
import { ListService } from '..//list.service';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
declare var bootstrap: any; 
@Component({
  selector: 'app-product-list',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  products: any[] = [];
  productForm!: FormGroup;
  isEdit: boolean = false; // flag to check if editing
  selectedProductCode: string = '';
  paginatedProducts: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;


  constructor(private listService: ListService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProducts();

    this.productForm = this.fb.group({
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      productPrice: ['0', [Validators.required, Validators.min(0)]],
      productStatus: ['Active', Validators.required]
    });

  }

  loadProducts() {
    // 💡 Assuming listService.products$ is an Observable<any[]> containing ALL products
     (this.listService.products$ as Observable<any[]>).subscribe((res) => {
       this.products = res || [];
    
            // 🔥 PAGINATION LOGIC
      this.totalPages = Math.max(1, Math.ceil(this.products.length / this.itemsPerPage));
            
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
       this.updatePaginatedProducts();
    });
  }
  updatePaginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
  this.paginatedProducts = this.products.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  openAddModal() {
    this.isEdit = false;
    this.productForm.reset({ productStatus: 'Active' });
    // Open Bootstrap modal
    const modal: any = document.getElementById('productModal');
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  openEditModal(product: any) {
    this.isEdit = true;
    this.selectedProductCode = product.productCode;
    this.productForm.patchValue({
      productCode: product.productCode,
      productName: product.productName,
      productPrice: product.productPrice,
      productStatus: product.productStatus
    });
    const modal: any = document.getElementById('productModal');
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  saveProduct() {
    debugger
    if (this.productForm.invalid) return;

    if (this.isEdit) {
      const updatedProduct = { ...this.productForm.value, code: this.selectedProductCode };
      this.listService.updateProduct(updatedProduct);
      const Toast = Swal.mixin({ 
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "success",
        title: "Product Updated successfully"
      });
    } else {
      this.listService.addProduct(this.productForm.value);
      const Toast = Swal.mixin({ 
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "success",
        title: "Product Added successfully"
      });
      this.loadProducts();
    }

    // Close modal
    const modal: any = document.getElementById('productModal');
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    this.loadProducts();
  }

  deleteProduct(product: any) {
    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to mark "${product.productName}" as Inactive?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Inactivate',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true, // better UX: focuses cancel button
    }).then((result) => {
      if (result.isConfirmed) {
        // Change status to Inactive
        product.productStatus = 'Inactive';
  
        // Update product in your service
        this.listService.updateProduct({
          code: product.productCode,
          productCode: product.productCode,
          productName: product.productName,
          productPrice: product.productPrice,
          productStatus: product.productStatus
        });
         this.loadProducts();
        // Refresh table
        this.listService.getProducts().subscribe(res => this.products = res);
  
        // Show toast notification
       // Swal.fire({
         // toast: true,
          //position: 'top-end',
          //icon: 'success',
          //title: `"${product.productName}" marked Inactive!`,
          //showConfirmButton: false,
          //timer: 1800,
          //timerProgressBar: true,
          //background: '#f0f2f5'
        //});
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Optional: show a cancel notification
        
      }
    });
  }
  
  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

sortTable(column: string) {
  if (this.sortColumn === column) {
    // toggle direction
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.products.sort((a: any, b: any) => {
    let valA = a[column];
    let valB = b[column];

    // If the column is numeric
    if (typeof valA === 'number' && typeof valB === 'number') {
      return this.sortDirection === 'asc' ? valA - valB : valB - valA;
    }

    // For strings (case-insensitive)
    valA = valA.toString().toLowerCase();
    valB = valB.toString().toLowerCase();
    if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  this.updatePaginatedProducts();

}
isSidebarOpen: boolean = false;

// Call this from your sidebar toggle
toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}
setStatus(status: string) {
  this.productForm.get('productStatus')?.setValue(status);
}
get pages(): number[] {
  return this.totalPages > 1 ? Array.from({ length: this.totalPages }, (_, i) => i + 1) : [];
}
}


