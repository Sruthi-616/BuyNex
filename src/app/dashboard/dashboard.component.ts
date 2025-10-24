import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import Config from 'chart.js/dist/core/core.config';
import Swal from 'sweetalert2';
import { ListService } from '../list.service';
import { Service1Service } from '../service1.service';
import { Service2Service } from '../service2.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  isSidebarOpen = false;
  username: string | null = null;
  role: string | null = null;
  totalProducts = 0;
  pieChart: any;
  activeProducts: number = 0;
  inactiveProducts: number = 0;
  isDashboardRoute = false;

  // Pie Chart config

  // Charts
  activeInactiveChart: any;
  productPriceChart: any;

  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'left' }
    }
  };

  pieChartLabels: string[] = ['Active', 'Inactive'];
  pieChartData: number[] = [];

  productPriceLabels: string[] = [];
  productPriceData: number[] = [];
  orderLabels: string[]=[];
  orderData: number[]=[]
  cartLabels: string[] = [];
  cartData: number[] =[];
  t:any;
  orderChart:any;
  p:any;
  totalOrders:any;
  totalCartItems:any;
  orders:any;
  cartChart:any;
  chart:any;
  config:any;
  constructor(private router: Router,private r:ListService,private o:Service2Service,private res : Service1Service) {}
     ngOnInit() {
      this.username = localStorage.getItem('username');
      this.role = localStorage.getItem('role');
  
      if (!localStorage.getItem('user')) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please log in again.',
          confirmButtonColor: '#0d6efd'
        });
        this.router.navigateByUrl('');
      }
      this.r.products$.subscribe(products => {
        this.totalProducts = products.length;
        this.activeProducts = products.filter(p => p.productStatus === 'Active').length;
        this.inactiveProducts = products.filter(p => p.productStatus === 'Inactive').length;
      
        this.pieChartData = [this.activeProducts, this.inactiveProducts];
        if (this.activeInactiveChart) this.activeInactiveChart.destroy();

        // Create chart
      
        setTimeout(() => this.createActiveInactiveChart(), 0);
      
        // Orders (assuming synchronous)
      
        this.r.getProducts().subscribe(products => {
          this.totalProducts = products.length;
        
          // Products that have been ordered
          this.t = this.o.getAll();
          const orderedProductsCount = this.t;
          const notOrderedProductsCount = this.totalProducts - orderedProductsCount;
        
          // Update pie chart data
          this.orderLabels = ['Ordered Products', 'Not Ordered Products'];
          this.orderData = [orderedProductsCount, notOrderedProductsCount];
  
        });
        

    
      });
      this.t=this.o.getAll();
      this.totalOrders=this.o.get();
      this.totalCartItems=this.res.getCartLength();
      this.updatePieChart();

  }
  ngAfterViewInit(): void {
    // Create the pie chart after DOM is rendered
    this.createOrderPieChart();
    this.createPieChart();
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
  orderPie:any;
  createPieChart() {
    if (!this.orderPie) return;

    const data = {
      datasets: [{
        data: [this.totalCartItems, 1], // green slice + white
        backgroundColor: ['green', '#e0e0e0'],
        borderWidth: 0
      }]
    };

    const options = {
      responsive: true,
      plugins: { tooltip: { enabled: false } },
      cutout: '0%' // full pie
    };

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(this.orderPie.nativeElement, {
      type: 'pie',
      data,
      options
    });
  }

  updatePieChart() {
    if (!this.pieChart) {
      this.createPieChart();
    } else {
      // Update chart with new totalCartItems
      this.pieChart.data.datasets[0].data = [this.totalCartItems, 1];
      this.pieChart.update();
    }
  }
  createActiveInactiveChart(): void {
    const canvas = document.getElementById('activeInactiveChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    if (this.activeInactiveChart) this.activeInactiveChart.destroy();
  
    this.activeInactiveChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Active', 'Inactive'],
        datasets: [{ data: [this.activeProducts, this.inactiveProducts], backgroundColor: ['#28a745', '#dc3545'] }]
      },
      options: { responsive: true }
      
    });
}
    

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('loggedInUser');

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
      title: "Logout successfully"
    });
    

    this.router.navigateByUrl('');
  }

  onProductsChange(count: number) {
    this.totalProducts = count;
    console.log('Received from child:', count);
  }

  get isDashboardPage(): boolean {
    return this.router.url === '/dash';
  }
  change(){
    this.router.navigateByUrl('/forgot');
  }
  

}
