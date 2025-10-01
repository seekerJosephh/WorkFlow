
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";


@Component({
    selector: 'app-request-email-form',
    templateUrl: 'request-email-form.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class RequestEmailFormComponent implements OnInit {
  emailForm!: FormGroup;

  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  years: number[] = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.emailForm = this.fb.group({
        date: [today],
        department: [''],
        applicantName: [''],
        applicantPhone: [''],
        revised: [''],
        users: this.fb.array([this.createUserRow()]),
        preparedBy: [''],
        checkedBy: [''],
        ITpreparedBy: ['Mr.A'],
        ITcheckBy: ['Mr.B'],
        ITverifiedBy: ['Mr.C'],
        ITapprovedBy: ['Mr.D'],
        purpose: ['']
    });
    }


    get users(): FormArray {
    return this.emailForm.get('users') as FormArray;
    }


    createUserRow(): FormGroup {
    return this.fb.group({
        classification: [''],
        isEmail: [false],
        isADUser: [false],
        id: [''],
        sex: [''],
        firstName: [''],
        familyName: [''],
        section: [''],
        position: [''],
        beforeChange: [''],
        afterChange: ['']
    });
    }


  addUserRow() {
    this.users.push(this.createUserRow());
  }

  deleteUserRow() {
    if (this.users.length > 1) {
      this.users.removeAt(this.users.length - 1);
    }
  }

  onSubmit() {
    console.log('Form Value:', this.emailForm.value);
    console.log('Form Valid:', this.emailForm.valid);
    console.log('Users Array:', this.users.value);
  }
}
