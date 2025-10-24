import { Component } from '@angular/core';
import { Service1Service } from '../service1.service';
import { Service2Service } from '../service2.service';

@Component({
  selector: 'app-userdashboard',
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.css']
})
export class UserdashboardComponent {
  totalOrders:any;
  totalCartItems:any;
  constructor(private o:Service2Service,private r : Service1Service){}
  ngOnInit(){
    debugger
    this.totalOrders=this.o.get();
    this.totalCartItems=this.r.getCartLength();
    console.log(this.totalCartItems)
  }

}
