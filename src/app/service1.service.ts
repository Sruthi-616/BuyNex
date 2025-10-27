import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Service1Service {

  constructor() { }
  //cart:any[]=[]
//addtocart(product:any){
    //this.cart.push(pobj);
//return "Add to Cart"
//const exists = this.cart.find(p => p.code === product.code);
    //if (!exists) {
      //this.cart.push(product);
   // }
    //return "Product added to cart";
  //}
  //getCartItems(){
    //return of(this.cart)
  //}
  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable(); // Observable for components

  addToCart(product: any) {
    const currentCart = this.cartSubject.getValue();
    const exists = currentCart.find(p => p.productCode === product.productCode);
    if (!exists) {
      this.cartSubject.next([...currentCart, product]); // Add new product
    }
  }
  removeFromCart(productCode: string) {
    const currentCart = this.cartSubject.getValue();
    this.cartSubject.next(currentCart.filter(p => p.productCode !== productCode));
  }

  getCart(): any[] {
    return this.cartSubject.getValue();
  }
  getCartLength(): number {
    return this.cartSubject.getValue().length;
  }
  userCart:any;
  //getSomeOrders(): any[] {
    
    //const username = localStorage.getItem('username'); // ✅ get from localStorage
    //console.log(username)
   // const userOrders = this.cart$.filter(cart => cart.userName === username);
    //return userOrders;
  //}
  //get():number{
    //return this.getSomeOrders().length;
  //}
}

