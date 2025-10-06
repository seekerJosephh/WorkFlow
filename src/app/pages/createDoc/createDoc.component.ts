import { Component, enableProdMode } from "@angular/core";
import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';
import { DxFileManagerModule } from 'devextreme-angular/ui/file-manager';
import { DxPopupModule } from 'devextreme-angular/ui/popup'; // Ensure this is correct
import * as DxFileManagerTypes from 'devextreme-angular/ui/file-manager';
import { Service, FileItem } from '../../shared/services/createDoc.service';
import { AppModule } from "src/app/app.module";
import { Router } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RequestEmailFormComponent } from "src/app/shared/components/request-email-form/request-email-form.component";




@Component({
  templateUrl: 'createDoc.component.html',
  styleUrls: ['./createDoc.component.scss'],
  providers: [Service],
  preserveWhitespaces: true,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DxFileManagerModule, DxPopupModule, RequestEmailFormComponent]
})

export class CreateDocComponent {
  emailForm: FormGroup;
  fileItems: FileItem[] | undefined;
  showEmailFormPopup: boolean = false;
  selectedFile?: FileItem;
 

  get users(): FormArray {
    return this.emailForm.get('users') as FormArray;
  }


  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  days: number[] = Array.from({length: 31}, (_, i) => i + 1);
  years: number[] = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);


  constructor(private fb: FormBuilder, private service: Service) {
      this.emailForm = this.fb.group({
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

    this.service.getFileItems().subscribe((items: FileItem[]) => {
      this.fileItems = items;
    });
  }


  createUserRow(): FormGroup {
      return this.fb.group({
          id: [''],
          sex: [''],
          firstName: [''],
          familyName: [''],
          section: [''],
          position: [''],
          beforeChange: [''],
          afterChnage: [''],
          classification: [''],
          isADUser: [false],

      });
  }

 
  displayImagePopup(event: any) {
    this.selectedFile = event.file;
    this.showEmailFormPopup = true;
  }

  closePopup() {
    this.showEmailFormPopup = false;
  }

  confirmClose(e: any) {
    const result = confirm("Are you sure you want to close the form? Unsaved changes will be lost."); 
    if (!result) {
      e.cancel = true; // Prevent the popup from closing
    }
  }


  onScroll(event: Event): void {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    console.log('Scrolled to:', scrollTop);
    
  }


  onSubmit(): void {
    if (this.emailForm.valid) {
      console.log('Form Submitted!' ,this.emailForm.value);
      alert('Form Submitted successfully!');
      this.emailForm.reset();
      this.closePopup();
    }
  }

}