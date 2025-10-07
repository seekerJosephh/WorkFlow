import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { FormService, FormSubmission, UserFormData } from "../../services/request-email-form.service";

@Component({
  selector: 'app-request-email-form',
  templateUrl: 'request-email-form.component.html',
  styleUrls: ['./request-email-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RequestEmailFormComponent implements OnInit {
  emailForm!: FormGroup;
  referForm!: FormGroup;
  isReferModalOpen = false;
  hasSearched = false;
  isPreviewVisible = false;
  submissionStatus: 'success' | 'error' | null = null;
  submissionMessage: string = '';
  submissionDetails: string = ''; 
  filteredPeople: { id: string; name: string; section: string; email: string }[] = [];
  private people: { id: string; name: string; section: string; email: string }[] = [
    { id: "001", name: "Chetra Pang", section: "IT", email: "chetrapang@scws.kh" },
    { id: "002", name: "Lyhem Heng", section: "Assy", email: "lyhemheng@scws.kh" },
    { id: "003", name: "Sophat", section: "FC", email: "sophat@scws.kh" },
    { id: "004", name: "Kosal", section: "QA", email: "kosal@scws.kh" },
    { id: "005", name: "Sambath", section: "IT", email: "sambath@scws.kh" },
  ];

  constructor(private fb: FormBuilder, private formService: FormService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.emailForm = this.fb.group({
      date: [today, Validators.required],
      department: ['', [Validators.required, Validators.maxLength(50)]],
      applicantName: ['', [Validators.required, Validators.maxLength(50)]],
      applicantPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      users: this.fb.array([this.createUserRow()]),
      preparedBy: ['', [Validators.required, Validators.maxLength(50)]],
      checkedBy: ['', [Validators.required, Validators.maxLength(50)]],
      ITpreparedBy: ['Mr.A', [Validators.required, Validators.maxLength(50)]],
      ITcheckedBy: ['Mr.B', [Validators.required, Validators.maxLength(50)]],
      ITverifiedBy: ['Mr.C', [Validators.required, Validators.maxLength(50)]],
      ITapprovedBy: ['Mr.D', [Validators.required, Validators.maxLength(50)]],
      purpose: ['', [Validators.required, Validators.maxLength(200)]],
      usersRefer: [[]]
    });
    this.referForm = this.fb.group({
      searchId: [''],
      searchName: [''],
      searchSection: ['']
    });
    this.filteredPeople = [...this.people];
  }

  get users(): FormArray {
    return this.emailForm.get('users') as FormArray;
  }

  createUserRow(): FormGroup {
    const userGroup = this.fb.group({
      classification: ['New registration', Validators.required],
      isEmail: [false],
      isADUser: [false],
      id: ['', Validators.required],
      idBeforeChange: [''],
      idAfterChange: [''],
      sex: ['', Validators.required],
      sexBeforeChange: [''],
      sexAfterChange: [''],
      firstName: ['', Validators.required],
      firstNameBeforeChange: [''],
      firstNameAfterChange: [''],
      familyName: ['', Validators.required],
      familyNameBeforeChange: [''],
      familyNameAfterChange: [''],
      section: ['', Validators.required],
      sectionBeforeChange: [''],
      sectionAfterChange: [''],
      position: ['', Validators.required],
      positionBeforeChange: [''],
      positionAfterChange: [''],
      beforeChange: [''],
      afterChange: ['']
    });

    userGroup.get('classification')?.valueChanges.subscribe(value => {
      const fields = [
        'idBeforeChange', 'idAfterChange',
        'sexBeforeChange', 'sexAfterChange',
        'firstNameBeforeChange', 'firstNameAfterChange',
        'familyNameBeforeChange', 'familyNameAfterChange',
        'sectionBeforeChange', 'sectionAfterChange',
        'positionBeforeChange', 'positionAfterChange',
        'beforeChange', 'afterChange'
      ];

      fields.forEach(field => {
        const control = userGroup.get(field);
        if (value === 'Change') {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      });

      if (value !== 'Change') {
        fields.forEach(field => userGroup.get(field)?.setValue(''));
        userGroup.get('id')?.setValidators([Validators.required]);
        userGroup.get('sex')?.setValidators([Validators.required]);
        userGroup.get('firstName')?.setValidators([Validators.required]);
        userGroup.get('familyName')?.setValidators([Validators.required]);
        userGroup.get('section')?.setValidators([Validators.required]);
        userGroup.get('position')?.setValidators([Validators.required]);
      } else {
        userGroup.get('id')?.clearValidators();
        userGroup.get('sex')?.clearValidators();
        userGroup.get('firstName')?.clearValidators();
        userGroup.get('familyName')?.clearValidators();
        userGroup.get('section')?.clearValidators();
        userGroup.get('position')?.clearValidators();
      }
      userGroup.get('id')?.updateValueAndValidity();
      userGroup.get('sex')?.updateValueAndValidity();
      userGroup.get('firstName')?.updateValueAndValidity();
      userGroup.get('familyName')?.updateValueAndValidity();
      userGroup.get('section')?.updateValueAndValidity();
      userGroup.get('position')?.updateValueAndValidity();
    });

    return userGroup;
  }

  addUserRow() {
    this.users.push(this.createUserRow());
  }

  deleteUserRow() {
    if (this.users.length > 1) {
      this.users.removeAt(this.users.length - 1);
    }
  }

  openReferModal() {
    this.isReferModalOpen = true;
    this.resetSearch();
  }

  closeReferModal() {
    this.isReferModalOpen = false;
    this.hasSearched = false;
  }

  searchPeople() {
    const { searchId, searchName, searchSection } = this.referForm.value;
    if (searchId || searchName || searchSection) {
      this.hasSearched = true;
      this.filteredPeople = this.people.filter(person =>
        (!searchId || person.id.toLowerCase().includes(searchId.toLowerCase())) &&
        (!searchName || person.name.toLowerCase().includes(searchName.toLowerCase())) &&
        (!searchSection || person.section === searchSection)
      );
    } else {
      this.hasSearched = false;
      this.filteredPeople = [];
    }
  }

  resetSearch() {
    this.referForm.reset({ searchId: '', searchName: '', searchSection: '' });
    this.filteredPeople = [];
    this.hasSearched = false;
  }

  selectPerson(person: { id: string; name: string; section: string; email: string }) {
    this.emailForm.get('checkedBy')?.setValue(person.name);
    this.emailForm.get('usersRefer')?.setValue([person]);
    this.closeReferModal();
  }

  isAnyClassificationChange(): boolean {
    return this.users.controls.some(control => control.get('classification')?.value === 'Change');
  }

  saveDocument(): void {
    if (this.emailForm) {
      this.isPreviewVisible = true;
      this.submissionStatus = null;
      this.submissionMessage = '';
      this.submissionDetails = '';
    } 
    // else {
    //   this.submissionStatus = 'error';
    //   this.submissionMessage = 'Please fill out all required fields correctly.';
    //   this.submissionDetails = '';
    //   console.log('Form Errors:', this.emailForm.errors);
    //   console.log('Users Errors:', this.users.controls.map(control => control.errors));
    // }
  }

  backToEdit(): void {
    this.isPreviewVisible = false;
    this.submissionStatus = null;
    this.submissionMessage = '';
    this.submissionDetails = '';
  }

  onSubmit() {
    if (this.emailForm) {
      const formData: FormSubmission = this.emailForm.value;
      console.log('Form Data:', JSON.stringify(formData, null, 2));
      this.formService.submitForm(formData).subscribe({
        next: (response) => {
          this.submissionStatus = 'success';
          this.submissionMessage = response.message || 'Form submitted successfully';
          this.submissionDetails = '';
          // Reset form to initial state
          this.emailForm.reset({
            date: new Date().toISOString().split('T')[0],
            department: '',
            applicantName: '',
            applicantPhone: '',
            purpose: '',
            preparedBy: '',
            checkedBy: '',
            ITpreparedBy: 'Mr.A',
            ITcheckedBy: 'Mr.B',
            ITverifiedBy: 'Mr.C',
            ITapprovedBy: 'Mr.D',
            users: [this.createUserRow().value],
            usersRefer: []
          });
          this.isPreviewVisible = false;
        },
        error: (error) => {
          this.submissionStatus = 'error';
          this.submissionMessage = error.error?.message || 'Failed to submit form';
          this.submissionDetails = error.error?.details || 'No additional details available';
          console.error('Submission error:', error);
        }
      });
    } 
    // else {
    //   this.submissionStatus = 'error';
    //   this.submissionMessage = 'Please fill out all required fields correctly.';
    //   this.submissionDetails = '';
    //   console.log('Form Errors:', this.emailForm.errors);
    //   console.log('Users Errors:', this.users.controls.map(control => control.errors));
    // }
  }
}