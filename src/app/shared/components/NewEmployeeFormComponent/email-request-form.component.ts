import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-email-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-email-form.component.html',
  styleUrls: ['./employee-email-form.component.scss']
})
export class EmployeeEmailFormComponent implements OnInit {
  emailForm: FormGroup;
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  days: number[] = Array.from({length: 31}, (_, i) => i + 1);
  years: number[] = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);

  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      prefix: [''],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      preferredName: [''],
      dobMonth: [''],
      dobDay: [''],
      dobYear: [''],
      nicPassport: ['', Validators.required],
      resStreet1: ['', Validators.required],
      resStreet2: [''],
      resCity: ['', Validators.required],
      resState: ['', Validators.required],
      resPostCode: ['', Validators.required],
      resCountry: ['', Validators.required],
      permStreet1: ['', Validators.required],
      permStreet2: [''],
      permCity: ['', Validators.required],
      permState: ['', Validators.required],
      permPostCode: ['', Validators.required],
      permCountry: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{3}-[0-9]{3}-[0-9]{4}$')]],
      personalEmail: ['', [Validators.required, Validators.email]],
      nationality: ['', Validators.required],
      gender: [''],
      date: ['']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.emailForm.valid) {
      console.log('Form Submitted:', this.emailForm.value);
      alert('Form submitted successfully!');
      this.emailForm.reset();
    }
  }
}