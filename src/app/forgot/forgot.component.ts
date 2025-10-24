import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent {
  changeForm!: FormGroup;
  users: any[] = [];
  currentUser: any;

  showOld: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
      this.users = JSON.parse(localStorage.getItem('users') || '[]');
      const username = localStorage.getItem('username') || '';
    
      this.currentUser = this.users.find(u => u.username === username);
    
      this.changeForm = this.fb.group({
        username: [{ value: this.currentUser.username, disabled: true }],
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator });
    }
    

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePassword(field: string) {
    if (field === 'old') this.showOld = !this.showOld;
    else if (field === 'new') this.showNew = !this.showNew;
    else if (field === 'confirm') this.showConfirm = !this.showConfirm;
  }

  onSubmit() {
    if (this.changeForm.invalid) return;

    const { oldPassword, newPassword } = this.changeForm.getRawValue(); // getRawValue to include disabled username

    if (oldPassword !== this.currentUser.password) {
      this.showToast('error', 'Old password is incorrect');
      return;
    }

    // Update password
    this.currentUser.password = newPassword;
    localStorage.setItem('users', JSON.stringify(this.users));
    this.showToast('success', 'Password updated successfully');
    this.changeForm.reset({
      username: this.currentUser.username
    });
  }

  showToast(icon: 'success' | 'error', title: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
}
