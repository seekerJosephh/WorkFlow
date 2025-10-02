
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";


@Component({
    selector: 'app-request-email-form',
    templateUrl: 'request-email-form.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class RequestEmailFormComponent implements OnInit {
  emailForm!: FormGroup;
  isDisabled = true;
  referForm!: FormGroup;
  isReferModalOpen = false;
  hasSearched = false;
  filteredPeople: { id: string; name: string; section: string }[] = [];
  private people: { id: string; name: string; section: string }[] = [
    { id: "001", name: "A", section: "IT" },
    { id: "002", name: "B", section: "Assy" },
    { id: "003", name: "C", section: "FC" },
    { id: "004", name: "D", section: "QA" },
    { id: "005", name: "E", section: "IT" }
  ];

  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  years: number[] = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.emailForm = this.fb.group({
      date: [today, Validators.required],
      department: ['', Validators.required],
      applicantName: ['', Validators.required],
      applicantPhone: ['', Validators.required],
      revised: [''],
      users: this.fb.array([this.createUserRow()]),
      preparedBy: ['', Validators.required],
      checkedBy: ['', Validators.required],
      ITpreparedBy: ['Mr.A', Validators.required],
      ITcheckBy: ['Mr.B', Validators.required],
      ITverifiedBy: ['Mr.C', Validators.required],
      ITapprovedBy: ['Mr.D', Validators.required],
      purpose: ['', Validators.required]
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
        const beforeChangeControl = userGroup.get('beforeChange');
        const afterChangeControl = userGroup.get('afterChange');

        if (value === 'Change'){
          beforeChangeControl?.setValidators([Validators.required]);
          afterChangeControl?.setValidators([Validators.required]);
        } else {
          beforeChangeControl?.clearValidators();
          afterChangeControl?.clearValidators();
        }
        beforeChangeControl?.updateValueAndValidity();
        afterChangeControl?.updateValueAndValidity();
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


  selectPerson(name: string) {
    this.emailForm.get('checkedBy')?.setValue(name);
    this.closeReferModal();
  }

  isAnyClassificationChange(): boolean {
    return this.users.controls.some(control => control.get('classification')?.value === 'Change');
  }
  onSubmit() {
    console.log('Form Value:', this.emailForm.value);
    // console.log('Form Valid:', this.emailForm.valid);
    // console.log('Users Array:', this.users.value);
  }
}
