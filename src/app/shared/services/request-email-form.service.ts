import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from "rxjs";


export interface UserFormData {
  classification: string;
  isEmail: boolean;
  isADUser: boolean;
  id: string;
  idBeforeChange?: string;
  idAfterChange?: string;
  sex: string;
  sexBeforeChange?: string;
  sexAfterChange?: string;
  firstName: string;
  firstNameBeforeChange?: string;
  firstNameAfterChange?: string;
  familyName: string;
  familyNameBeforeChange?: string;
  familyNameAfterChange?: string;
  section: string;
  sectionBeforeChange?: string;
  sectionAfterChange?: string;
  position: string;
  positionBeforeChange?: string;
  positionAfterChange?: string;
  beforeChange?: string;
  afterChange?: string;
}
export interface FormSubmission {
  date: string;
  department: string;
  applicantName: string;
  applicantPhone: string;
  purpose: string;
  preparedBy: string;
  checkedBy: string;
  ITpreparedBy: string;
  ITcheckedBy: string;
  ITverifiedBy: string;
  ITapprovedBy: string;
  users: UserFormData[];
  usersRefer: { id: string; name: string; section: string; email: string }[];
}

export interface PendingDoc {
  Id: number;
  CreatedAt: string; 
  FormDate: string;
  Department: string;
  ApplicantName: string;
  ApplicantPhone: string;
  Purpose: string;
  PreparedBy: string;
  CheckedBy: string;
  ITPreparedBy: string;
  ITCheckedBy: string;
  ITVerifiedBy: string;
  ITApprovedBy: string;
  RequestCheckedStatus: string; 
  ITPreparedStatus: string; 
  ITCheckedStatus: string; 
  ITVerifiedStatus: string; 
  ITApprovedStatus: string; 
  OverallStatus: string; 
  Users: UserFormData[];
  usersRefer: { id: string; name: string; section: string; email: string } [];
}

@Injectable({
    providedIn: 'root'
})

export class FormService {
    private apiUrl = 'http://localhost:3000/api';
    constructor(private http: HttpClient) {}

    // Submit form data to server
    submitForm(formData: FormSubmission): Observable<any> {
        return this.http.post(`${this.apiUrl}/submit-form`, formData).pipe(
            catchError(this.handleError)
        );
    }
    // Fetch pending documents
    getPendingDocs(): Observable<{ success: boolean; data: PendingDoc[]; count: number }> {
        return this.http.get<{ success: boolean; data: PendingDoc[]; count: number }>(`${this.apiUrl}/pending-docs`).pipe(
        catchError(this.handleError)
        );
    }

    // Fetch single form by ID
    getFormById(id: number): Observable<{ success: boolean; data: any }> {
        return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/forms/${id}`).pipe(
        catchError(this.handleError)
        );
    }

    // Update approval status 
    updateApproval(id: number, statusData: { status: string; approver: string; section: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/forms/${id}/approve`, statusData).pipe(
        catchError(this.handleError)
        );
    }


    private handleError(error: HttpErrorResponse ) {
        let errorMessage = 'Unknow error Occurred'
            if (error.error instanceof ErrorEvent) {
                errorMessage = `Client Error: ${error.error.message}`;
            } else {
                errorMessage = `Server Error: ${error.status}\n Message: ${error.error.message}`
            }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));

    }
}