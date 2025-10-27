import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { ListService } from '../list.service';
import { Service1Service } from '../service1.service';
import { Service2Service } from '../service2.service';
declare var bootstrap: any; // ✅ allows modal closing after order

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cart: any[] = [];
  products: any[] = [];
  selectedProduct: any = null;
  buyNowForm!: FormGroup;
  username: string = '';
  zone:any;
  //private zone: NgZone;
  constructor(private cartService: Service1Service,private s:ListService,private fb:FormBuilder,private orderService:Service2Service) {}

 carts:any;
  ngOnInit() {
    // Subscribe to the cart 
    this.buyNowForm = this.fb.group({
      userName: [''],
      productName: [''],
      productPrice: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')],Validators.maxLength(10)],
      address: ['', Validators.required]
    });
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.username = parsedUser.username;
      this.buyNowForm.patchValue({ userName: this.username });
      console.log(this.username)
    }

    this.s.getProducts().subscribe((data: any) => {
      this.products = data;
    });

    this.cartService.cart$.subscribe(items => (this.cart = items));
  }

  removeFromCart(productCode: string) {
    this.cartService.removeFromCart(productCode);
    console.log(productCode)
  }
  openBuyNow(product: any) {
    this.selectedProduct = { ...product };
    this.buyNowForm.patchValue({
      userName:this.username,
      productName: product.productName,
      productPrice: product.productPrice,
      //phoneNumber: '',
      //address: '',
    });
    this.zone.runOutsideAngular(() => {
      const modalEl = document.getElementById('buyNowModal');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    });
  }
  onOrder() {
    if (this.buyNowForm.invalid) {
      this.buyNowForm.markAllAsTouched();
      return;
    }
  
    const orderData = {
      ...this.buyNowForm.value,
      orderDate: new Date(),
      
    };
    

// Call service
this.orderService.placeOrder(orderData).subscribe({
  next: (res) => {
    // Add to service array
    this.orderService.addOrder(orderData);
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
      title: "Order Placed successfully"
    });
    
  },
  error: (err) => {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Error placing order',
      text: err.message
    });
  }
});


  
        // Close modal
 const modalEl = document.getElementById('buyNowModal');
 const modalInstance = bootstrap.Modal.getInstance(modalEl);
 modalInstance?.hide();
  
        // Reset form
 this.buyNowForm.reset();
 this.buyNowForm.patchValue({ userName: this.username });
  }
  }
