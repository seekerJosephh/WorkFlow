
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

    get users(): FormArray  {
        return this.emailForm.get('users') as FormArray;
    }

    constructor(private fb: FormBuilder) {}
    ngOnInit() {
        this.emailForm = this.fb.group({
        isEmail: [true],
        isADUser: [false],
        isNew: [false],
        isDelete: [false],
        isChange: [false],
        date: [''],
        department: [''],
        applicantName: [''],
        applicantPhone: [''],
        revised: [''],
        users: this.fb.array([this.createUserRow()]),
        preparedBy: [''],
        checkedBy: [''],
        verifiedBy: [''],
        approvedBy: [''],
        purpose: ['']
        });
    }

    createUserRow(): FormGroup {
        return this.fb.group({
            id: [' '],
            sex: [' '],
            firstName: [' '],
            familyName: [' '],
            internaLine: [' '],
            outsideLine: [' '],
            section: [' '],
            position: [' '],
            beforeChange: [' '],
            afterChnage: [' '],
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
        console.log(this.emailForm.value);
    }
    
}