import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular';
import { FormService, FormSubmission, UserFormData, Section, Employee } from '../../services/request-email-form.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-request-email-form',
  templateUrl: './request-email-form.component.html',
  styleUrls: ['./request-email-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DxDataGridModule]
})
export class RequestEmailFormComponent implements OnInit, OnDestroy {
  emailForm!: FormGroup;
  referForm!: FormGroup;
  isReferModalOpen = false;
  hasSearched = false;
  isPreviewVisible = false;
  submissionStatus: 'success' | 'error' | null = null;
  submissionMessage: string = '';
  submissionDetails: string = '';
  sections: Section[] = [];
  people: Employee[] = [];
  filteredPeople: Employee[] = [];
  isLoadingEmployees = false;
  employeeLoadError: string | null = null;
  private subscriptions: Subscription[] = [];
  currentField: string = '';
  isAdmin: boolean = false; 

  constructor(private fb: FormBuilder, private formService: FormService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {


    const today = new Date().toISOString().split('T')[0];
    this.emailForm = this.fb.group({
      date: [today, Validators.required],
      department: ['', [Validators.required]],
      applicantName: ['', [Validators.required, Validators.maxLength(50)]],
      applicantPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      users: this.fb.array([this.createUserRow()]),
      preparedBy: ['', [Validators.required, Validators.maxLength(50)]],
      checkedBy: ['', [Validators.required, Validators.maxLength(50)]],
      ITpreparedBy: ['', [Validators.required, Validators.maxLength(50)]],
      ITcheckedBy: ['', [Validators.required, Validators.maxLength(50)]],
      ITverifiedBy: ['', [Validators.required, Validators.maxLength(50)]],
      ITapprovedBy: ['', [Validators.required, Validators.maxLength(50)]],
      purpose: ['', [Validators.required, Validators.maxLength(200)]],
      usersRefer: [[]],
      // ITRefer: [[]]
    });
    this.referForm = this.fb.group({
      searchId: [''],
      searchName: [''],
      searchSection: ['']
    });

    this.filteredPeople = [];

    // Initialize default ITRefer values
    const defaultITRefer = [
      { id: '0824-21064', name: 'Kosal Khlang', section: 'IFM', email: 'kosal-khlang@sws.com' },
      { id: '0921-13426', name: 'Dara Manh', section: 'IFM', email: 'dara-manh@sws.com' },
      { id: '0514-3961', name: 'Sambath Prum', section: 'IFM', email: 'sambath-prum@sws.com' },
      { id: '0512-0476', name: 'Seangdy Thy', section: 'ADM', email: 'seangdy-thy@sws.com' }
    ];

    this.emailForm.patchValue({
      ITpreparedBy: 'Kosal Khlang',
      ITcheckedBy: 'Dara Manh',
      ITverifiedBy: 'Sambath Prum',
      ITapprovedBy: 'Seangdy Thy',
      ITRefer: defaultITRefer
    });


    this.formService.getSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        console.log('Fetched sections:', JSON.stringify(this.sections, null, 2));
      },
      error: (error) => {
        console.error('Error fetching sections:', error);
        this.submissionStatus = 'error';
        this.submissionMessage = 'Failed to load sections';
        this.submissionDetails = error.message;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get users(): FormArray {
    return this.emailForm.get('users') as FormArray;
  }

  getSectionCode(sectid: string | number): string {
    const section = this.sections.find(s => s.sectid === Number(sectid));
    return section ? section.SectionCode : 'Unknown Section';
  }

  createUserRow(): FormGroup {
    const userGroup = this.fb.group({
      classification: ['New registration', Validators.required],
      isEmail: [false],
      isADUser: [false],
      id: ['', [Validators.required]],
      sex: ['', Validators.required],
      sexBeforeChange: [''],
      sexAfterChange: [''],
      firstName: ['', Validators.required],
      firstNameBeforeChange: [''],
      firstNameAfterChange: [''],
      familyName: ['', Validators.required],
      familyNameBeforeChange: [''],
      familyNameAfterChange: [''],
      position: ['', Validators.required],
      positionBeforeChange: [''],
      positionAfterChange: [''],
      section: ['', Validators.required],
      sectionBeforeChange: [''],
      sectionAfterChange: [''],
      beforeChange: [''],
      afterChange: ['']
    });

    this.subscribeToIdChanges(userGroup);

    userGroup.get('classification')?.valueChanges.subscribe(value => {
      const fields = [
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
          control?.updateValueAndValidity();
        } else {
          control?.clearValidators();
          control?.setValue('');
          control?.updateValueAndValidity();
        }
      });

      const requiredFields = ['sex', 'firstName', 'familyName', 'section', 'position'];
      requiredFields.forEach(field => {
        const control = userGroup.get(field);
        if (value !== 'Change') {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
          control?.setValue('');
        }
        control?.updateValueAndValidity();
      });
      userGroup.get('id')?.setValidators([Validators.required]);
      userGroup.get('id')?.updateValueAndValidity();
    });

    return userGroup;
  }

  private subscribeToIdChanges(userGroup: FormGroup): void {
    const idControl = userGroup.get('id');
    const sectionMap: { [key: string]: string } = {};

    if (idControl) {
      this.subscriptions.push(
        idControl.valueChanges.subscribe(value => {
          const classification = userGroup.get('classification')?.value;
          console.log('ID value changed:', value, 'Classification:', classification);

          const resetPatchData = {
            firstName: classification === 'Change' ? '' : '',
            familyName: classification === 'Change' ? '' : '',
            section: classification === 'Change' ? '' : '',
            position: classification === 'Change' ? '' : '',
            firstNameBeforeChange: classification === 'Change' ? '' : '',
            familyNameBeforeChange: classification === 'Change' ? '' : '',
            sectionBeforeChange: classification === 'Change' ? '' : '',
            positionBeforeChange: classification === 'Change' ? '' : ''
          };
          userGroup.patchValue(resetPatchData, { emitEvent: false });
          console.log('Reset fields with:', resetPatchData);

          if (value && classification) {
            console.log('Fetching employee for ID:', value);
            this.formService.getEmployeeById(value).subscribe({
              next: (response: any) => {
                console.log('Employee fetch response:', response);
                if (response.success && response.data) {
                  const employee = response.data;
                  const names = employee.englishName ? employee.englishName.split(' ') : [''];
                  const firstName = names[0] || '';
                  const familyName = names.slice(1).join(' ') || '';
                  const section = sectionMap[employee.sectionName] || employee.sectionName || '';
                  const position = employee.position || 'Staff';

                  const patchData = {
                    firstName: classification === 'Change' ? '' : firstName,
                    familyName: classification === 'Change' ? '' : familyName,
                    section: classification === 'Change' ? '' : section,
                    position: classification === 'Change' ? '' : position,
                    firstNameBeforeChange: classification === 'Change' ? firstName : '',
                    familyNameBeforeChange: classification === 'Change' ? familyName : '',
                    sectionBeforeChange: classification === 'Change' ? section : '',
                    positionBeforeChange: classification === 'Change' ? position : ''
                  };

                  console.log('Patching form with:', patchData);
                  userGroup.patchValue(patchData, { emitEvent: false });
                } else {
                  console.log('No employee found for ID:', value);
                  userGroup.patchValue(resetPatchData, { emitEvent: false });
                }
                this.cdr.markForCheck();
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Error fetching employee for ID:', value, error);
                console.log('Error occurred, resetting fields with:', resetPatchData);
                userGroup.patchValue(resetPatchData, { emitEvent: false });
                this.cdr.markForCheck();
                this.cdr.detectChanges();
              }
            });
          } else {
            console.log('ID empty or no classification, resetting fields with:', resetPatchData);
            userGroup.patchValue(resetPatchData, { emitEvent: false });
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  addUserRow() {
    this.users.push(this.createUserRow());
  }

  deleteUserRow() {
    if (this.users.length > 1) {
      this.users.removeAt(this.users.length - 1);
    }
  }

  openReferModal(field: string) {
    this.currentField = field;
    this.isReferModalOpen = true;
    this.isLoadingEmployees = true;
    this.employeeLoadError = null;
    this.resetSearch();

    this.formService.getEmployees().subscribe({
      next: (employees) => {
        this.people = employees;
        this.filteredPeople = [];
        this.isLoadingEmployees = false;
        console.log('Fetched employees:', JSON.stringify(this.people, null, 2));
        console.log('Available sectionNames:', [...new Set(this.people.map(p => p.sectionName))]);
        console.log('SectionCodes from sections:', this.sections.map(s => s.SectionCode));
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingEmployees = false;
        this.employeeLoadError = error.message;
        console.error('Error fetching employees:', error);
        this.cdr.detectChanges();
      }
    });
  }

  closeReferModal() {
    this.isReferModalOpen = false;
    this.hasSearched = false;
    this.people = [];
    this.filteredPeople = [];
    this.employeeLoadError = null;
    this.currentField = '';
    this.cdr.detectChanges();
  }

  searchPeople() {
    const { searchId, searchName, searchSection } = this.referForm.value;
    console.log('Search inputs:', { searchId, searchName, searchSection });
    console.log('Available sectionNames:', [...new Set(this.people.map(p => p.sectionName))]);
    if (searchId || searchName || searchSection) {
      this.hasSearched = true;
      this.filteredPeople = this.people.filter(person =>
        (!searchId || person.employeeCode.toLowerCase().includes(searchId.toLowerCase())) &&
        (!searchName || person.englishName.toLowerCase().includes(searchName.toLowerCase())) &&
        (!searchSection || person.sectionName.toLowerCase() === searchSection.toLowerCase())
      );
      console.log('Filtered people:', JSON.stringify(this.filteredPeople, null, 2));
      this.cdr.detectChanges();
    } else {
      this.hasSearched = false;
      this.filteredPeople = [];
      this.cdr.detectChanges();
    }
  }

  resetSearch() {
    this.referForm.reset({ searchId: '', searchName: '', searchSection: '' });
    this.filteredPeople = [];
    this.hasSearched = false;
    this.cdr.detectChanges();
  }

  selectPerson(person: Employee) {
    this.emailForm.get(this.currentField)?.setValue(person.englishName);

    if (this.currentField === 'checkedBy') {
      const usersRefer = this.emailForm.get('usersRefer')?.value || [];
      if (!usersRefer.some((p: { id: string }) => p.id === person.employeeCode)) {
        usersRefer.push({
          id: person.employeeCode,
          name: person.englishName,
          section: person.sectionName,
          email: person.email
        });
      }
      this.emailForm.get('usersRefer')?.setValue(usersRefer);
    } else {
      const ITRefer = this.emailForm.get('ITRefer')?.value || [];
      if (!ITRefer.some((p: { id: string }) => p.id === person.employeeCode)) {
        ITRefer.push({
          id: person.employeeCode,
          name: person.englishName,
          section: person.sectionName,
          email: person.email
        });
      }
      this.emailForm.get('ITRefer')?.setValue(ITRefer);
    }

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
    console.log('Submitting form with payload:', JSON.stringify(formData, null, 2));
    this.formService.submitForm(formData).subscribe({
      next: (response) => {
        this.submissionStatus = 'success';
        this.submissionMessage = response.message || 'Form submitted successfully';
        this.submissionDetails = `Request ID: ${response.data.id}, Created At: ${response.data.createdAt}`;
        const defaultITRefer = [
          { id: '0824-21064', name: 'Kosal Khlang', section: 'IFM', email: 'kosal-khlang@sws.com' },
          { id: '0921-13426', name: 'Dara Manh', section: 'IFM', email: 'dara-manh@sws.com' },
          { id: '0514-3961', name: 'Sambath Prum', section: 'IFM', email: 'sambath-prum@sws.com' },
          { id: '0512-0476', name: 'Seangdy Thy', section: 'ADM', email: 'seangdy-thy@sws.com' }
        ];
        this.emailForm.reset({
          date: new Date().toISOString().split('T')[0],
          department: '',
          applicantName: '',
          applicantPhone: '',
          purpose: '',
          preparedBy: '',
          checkedBy: '',
          ITpreparedBy: 'Kosal Khlang',
          ITcheckedBy: 'Dara Manh',
          ITverifiedBy: 'Sambath Prum',
          ITapprovedBy: 'Seangdy Thy',
          users: [this.createUserRow().value],
          usersRefer: [],
          ITRefer: defaultITRefer
        });
        this.users.clear();
        this.users.push(this.createUserRow());
        this.isPreviewVisible = false;
      },
      error: (error) => {
        this.submissionStatus = 'error';
        this.submissionMessage = error.error?.message || 'Failed to submit form';
        this.submissionDetails = error.error ? JSON.stringify(error.error, null, 2) : 'No additional details';
        console.error('Submission error:', error);
      }
    });
  } else {
    this.submissionStatus = 'error';
    this.submissionMessage = 'Form is invalid';
    this.submissionDetails = 'Please fill out all required fields correctly';
  }
}
}