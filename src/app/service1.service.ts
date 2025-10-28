import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Service1Service {
  cart:any;
  constructor() { }
  private userCarts: { [username: string]: any[] } = {};
  
  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable(); // Observable for components

  addToCart(product: any) {
    //const currentCart = this.cartSubject.getValue();
    //const exists = currentCart.find(p => p.productCode === product.productCode);
    //if (!exists) {
      //this.cartSubject.next([...currentCart, product]); // Add new product
    //}
    const username = localStorage.getItem('username');
    if (!username) return;

    if (!this.userCarts[username]) {
      this.userCarts[username] = [];
    }

    const currentCart = this.userCarts[username];
    const exists = currentCart.find(p => p.productCode === product.productCode);

    if (!exists) {
      this.userCarts[username].push(product);
    }

    // Save to localStorage for persistence
    localStorage.setItem(`cart_${username}`, JSON.stringify(this.userCarts[username]));

    this.cartSubject.next([...this.userCarts[username]]);
  }
  removeFromCart(productCode: string) {
    //const currentCart = this.cartSubject.getValue();
   // this.cartSubject.next(currentCart.filter(p => p.productCode !== productCode));
    const username = localStorage.getItem('username');
    if (!username) return;

    this.userCarts[username] = (this.userCarts[username] || []).filter(p => p.productCode !== productCode);
    this.cartSubject.next(this.userCarts[username]);
  }


  getCart(): any[] {
    const username = localStorage.getItem('username')
    return this.cartSubject.getValue();
  }
  getCartLength(): number {
    const username =localStorage.getItem('username');
    return this.cartSubject.getValue().length;
  }
  
}

