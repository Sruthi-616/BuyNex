import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { ListService } from '../list.service';
import {  ChartType, ChartOptions } from 'chart.js';
import { Service2Service } from '../service2.service';
import { Service1Service } from '../service1.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent  implements OnInit{
  totalProducts = 0;
  activeProducts = 0;
  inactiveProducts = 0;
  totalCartItems:any;
  activeInactiveChart: any;
  orderChart: any;
  pieChart:any;
  orderLabels: string[] = [];
  orderData: number[] = [];
  t: any;

  constructor(private r: ListService, private o: Service2Service,private res:Service1Service) {}

  ngOnInit(): void {
    this.r.getProducts().subscribe(products => {
      this.totalProducts = products.length;
      this.activeProducts = products.filter(p => p.productStatus === 'Active').length;
      this.inactiveProducts = products.filter(p => p.productStatus === 'Inactive').length;

      // Get order data
      this.t = this.o.getAll();
      if (Array.isArray(this.t) && this.t.length > 0) {
        this.orderLabels = this.t.map(p => p.productName);
        this.orderData = this.t.map(p => p.orderCount);
      }

      // ✅ Create chart AFTER data is ready and DOM is available
      setTimeout(() => this.createActiveInactiveChart(), 0);
      
      this.r.getProducts().subscribe(products => {
        this.totalProducts = products.length;
      
        // Products that have been ordered
        this.t = this.o.getAll();
        const orderedProductsCount = this.t;
        const notOrderedProductsCount = this.totalProducts - orderedProductsCount;
      
        // Update pie chart data
        this.orderLabels = ['Ordered Products', 'Not Ordered Products'];
        this.orderData = [orderedProductsCount, notOrderedProductsCount];
      
        // ✅ Re-create the chart after data is ready
        this.createOrderPieChart();
        this.totalCartItems=this.res.getCartLength();
        this.createPieChart();
      });
    });
  }
  orderPie:any;
  createPieChart() {
    const data = {
      datasets: [{
        data: [this.totalCartItems, 1], // 1 represents empty portion
        backgroundColor: ['green', '#ffffff'], // green for orders, white for empty
        borderWidth: 0
      }]
    };

    const options = {
      responsive: true,
      cutout: '0%',
      plugins: {
        tooltip: {
          enabled: false
        }
      }
    };

    if (this.pieChart) this.pieChart.destroy(); // destroy previous chart

    this.pieChart = new Chart(this.orderPie.nativeElement, {
      type: 'pie',
      data,
      options
    });
  }
  createOrderPieChart(): void {
    const canvas = document.getElementById('orderPieChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    // Destroy old chart if it exists
    if (this.orderChart) {
      this.orderChart.destroy();
    }
  
    // Create new chart
    this.orderChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.orderLabels,
        datasets: [{
          data: this.orderData,
          backgroundColor: ['#28a745', '#dc3545'] // green = ordered, red = not ordered
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } }
      }
    });
  }

  ngAfterViewInit(): void {
    // Safety: if data is already available early, chart will render
    if (this.activeProducts + this.inactiveProducts > 0) {
      this.createActiveInactiveChart();
    }
    this.createOrderPieChart();
  }

  createActiveInactiveChart(): void {
    const canvas = document.getElementById('activeInactiveChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy old instance if any
    if (this.activeInactiveChart) this.activeInactiveChart.destroy();

    this.activeInactiveChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Active', 'Inactive'],
        datasets: [
          {
            data: [this.activeProducts, this.inactiveProducts],
            backgroundColor: ['#28a745', '#dc3545']
          }
        ]
      },
      options: { responsive: true }
    });
  }

  ngOnDestroy(): void {
    // ✅ Cleanup chart when leaving route
    if (this.activeInactiveChart) this.activeInactiveChart.destroy();
  }
}