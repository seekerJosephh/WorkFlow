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

    this.filteredPeople = [];

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
      id: ['', [Validators.required,]],
      idBeforeChange: ['', ],
      idAfterChange: ['', ],
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

  
    this.subscribeToIdChanges(userGroup);

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
          control?.setValidators([Validators.required,]); // Add pattern for id fields
          control?.updateValueAndValidity();
        } else {
          control?.clearValidators();
          control?.setValue('');
          control?.updateValueAndValidity();
        }
      });

      const requiredFields = ['id', 'sex', 'firstName', 'familyName', 'section', 'position'];
      requiredFields.forEach(field => {
        const control = userGroup.get(field);
        if (value !== 'Change') {
          if (field === 'id') {
            control?.setValidators([Validators.required,]);
          } else {
            control?.setValidators([Validators.required]);
          }
        } else {
          control?.clearValidators();
          control?.setValue('');
        }
        control?.updateValueAndValidity();
      });
    });

    return userGroup;
  }

  private subscribeToIdChanges(userGroup: FormGroup): void {
    const idControl = userGroup.get('id');
    const idBeforeChangeControl = userGroup.get('idBeforeChange');
    const idAfterChangeControl = userGroup.get('idAfterChange');

    // Map sectionName to section dropdown values
    const sectionMap: { [key: string]: string } = {
      'ADM': 'IT',
      'ASY': 'Assy',
      'FC': 'FC',
      'QA': 'QA'
      // Add more mappings as needed
    };

    if (idControl) {
      this.subscriptions.push(
        idControl.valueChanges.subscribe(value => {
          if (value && userGroup.get('classification')?.value !== 'Change' && /^\d{4}-\d{5}$/.test(value)) {
            this.formService.getEmployeeById(value).subscribe({
              next: (response: any) => {
                if (response.success && response.data) {
                  const employee = response.data;
                  const names = employee.englishName ? employee.englishName.split(' ') : [''];
                  const firstName = names[0] || '';
                  const familyName = names.slice(1).join(' ') || '';
                  const section = sectionMap[employee.sectionName] || employee.sectionName || '';
                  userGroup.patchValue({
                    firstName,
                    familyName,
                    section,
                    position: employee.position || 'Staff'
                  });
                } else {
                  userGroup.patchValue({
                    firstName: '',
                    familyName: '',
                    section: '',
                    position: ''
                  });
                }
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Error fetching employee for ID:', value, error);
                userGroup.patchValue({
                  firstName: '',
                  familyName: '',
                  section: '',
                  position: ''
                });
                this.cdr.detectChanges();
              }
            });
          } else if (value && !/^\d{4}-\d{5}$/.test(value)) {
            userGroup.patchValue({
              firstName: '',
              familyName: '',
              section: '',
              position: ''
            });
            this.cdr.detectChanges();
          }
        })
      );
    }

    if (idBeforeChangeControl) {
      this.subscriptions.push(
        idBeforeChangeControl.valueChanges.subscribe(value => {
          if (value && userGroup.get('classification')?.value === 'Change' && /^\d{4}-\d{5}$/.test(value)) {
            this.formService.getEmployeeById(value).subscribe({
              next: (response: any) => {
                if (response.success && response.data) {
                  const employee = response.data;
                  const names = employee.englishName ? employee.englishName.split(' ') : [''];
                  const firstNameBeforeChange = names[0] || '';
                  const familyNameBeforeChange = names.slice(1).join(' ') || '';
                  const sectionBeforeChange = sectionMap[employee.sectionName] || employee.sectionName || '';
                  userGroup.patchValue({
                    firstNameBeforeChange,
                    familyNameBeforeChange,
                    sectionBeforeChange,
                    positionBeforeChange: employee.position || 'Staff'
                  });
                } else {
                  userGroup.patchValue({
                    firstNameBeforeChange: '',
                    familyNameBeforeChange: '',
                    sectionBeforeChange: '',
                    positionBeforeChange: ''
                  });
                }
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Error fetching employee for ID Before Change:', value, error);
                userGroup.patchValue({
                  firstNameBeforeChange: '',
                  familyNameBeforeChange: '',
                  sectionBeforeChange: '',
                  positionBeforeChange: ''
                });
                this.cdr.detectChanges();
              }
            });
          } else if (value && !/^\d{4}-\d{5}$/.test(value)) {
            userGroup.patchValue({
              firstNameBeforeChange: '',
              familyNameBeforeChange: '',
              sectionBeforeChange: '',
              positionBeforeChange: ''
            });
            this.cdr.detectChanges();
          }
        })
      );
    }

    if (idAfterChangeControl) {
      this.subscriptions.push(
        idAfterChangeControl.valueChanges.subscribe(value => {
          if (value && userGroup.get('classification')?.value === 'Change' && /^\d{4}-\d{5}$/.test(value)) {
            this.formService.getEmployeeById(value).subscribe({
              next: (response: any) => {
                if (response.success && response.data) {
                  const employee = response.data;
                  const names = employee.englishName ? employee.englishName.split(' ') : [''];
                  const firstNameAfterChange = names[0] || '';
                  const familyNameAfterChange = names.slice(1).join(' ') || '';
                  const sectionAfterChange = sectionMap[employee.sectionName] || employee.sectionName || '';
                  userGroup.patchValue({
                    firstNameAfterChange,
                    familyNameAfterChange,
                    sectionAfterChange,
                    positionAfterChange: employee.position || 'Staff'
                  });
                } else {
                  userGroup.patchValue({
                    firstNameAfterChange: '',
                    familyNameAfterChange: '',
                    sectionAfterChange: '',
                    positionAfterChange: ''
                  });
                }
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Error fetching employee for ID After Change:', value, error);
                userGroup.patchValue({
                  firstNameAfterChange: '',
                  familyNameAfterChange: '',
                  sectionAfterChange: '',
                  positionAfterChange: ''
                });
                this.cdr.detectChanges();
              }
            });
          } else if (value && !/^\d{4}-\d{5}$/.test(value)) {
            userGroup.patchValue({
              firstNameAfterChange: '',
              familyNameAfterChange: '',
              sectionAfterChange: '',
              positionAfterChange: ''
            });
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

  openReferModal() {
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
    this.emailForm.get('checkedBy')?.setValue(person.englishName);
    this.emailForm.get('usersRefer')?.setValue([person]);
    this.closeReferModal();
  }

  isAnyClassificationChange(): boolean {
    return this.users.controls.some(control => control.get('classification')?.value === 'Change');
  }

  saveDocument(): void {
    if (this.emailForm.valid) {
      this.isPreviewVisible = true;
      this.submissionStatus = null;
      this.submissionMessage = '';
      this.submissionDetails = '';
    } else {
      this.submissionStatus = 'error';
      this.submissionMessage = 'Form is invalid';
      this.submissionDetails = 'Please fill out all required fields correctly';
    }
  }

  backToEdit(): void {
    this.isPreviewVisible = false;
    this.submissionStatus = null;
    this.submissionMessage = '';
    this.submissionDetails = '';
  }

  onSubmit() {
    if (this.emailForm.valid) {
      const formData: FormSubmission = this.emailForm.value;
      console.log('Submitting form with payload:', JSON.stringify(formData, null, 2));
      this.formService.submitForm(formData).subscribe({
        next: (response) => {
          this.submissionStatus = 'success';
          this.submissionMessage = response.message || 'Form submitted successfully';
          this.submissionDetails = `Request ID: ${response.data.id}, Created At: ${response.data.createdAt}`;
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