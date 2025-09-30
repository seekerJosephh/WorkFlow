import { Component, enableProdMode } from "@angular/core";
import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';
import { DxFileManagerModule } from 'devextreme-angular/ui/file-manager';
import { DxPopupModule } from 'devextreme-angular/ui/popup'; // Ensure this is correct
import * as DxFileManagerTypes from 'devextreme-angular/ui/file-manager';
import { Service, FileItem } from '../../shared/services/createDoc.service';
import { AppModule } from "src/app/app.module";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RequestEmailFormComponent } from "src/app/shared/components/request-email-form/request-email-form.component";

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

let modulePrefix = '';
// @ts-ignore
if (window && window.config?.packageConfigPaths) {
  modulePrefix = '/app';
}


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
 
  get users() {
    return this.emailForm.get('users') as any;
  }


  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  days: number[] = Array.from({length: 31}, (_, i) => i + 1);
  years: number[] = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);


  constructor(private fb: FormBuilder, private service: Service) {
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
      internalLine: [''],
      outsideLine: [''],
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

  displayImagePopup(event: any) {
    this.showEmailFormPopup = true;
  }

  closePopup() {
    this.showEmailFormPopup = false;
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