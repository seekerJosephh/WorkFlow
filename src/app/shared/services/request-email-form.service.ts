import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError, map } from "rxjs";


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
  department: any; // Changed to string to match VARCHAR(50)
  applicantName: string;
  applicantPhone: string;
  purpose: string;
  preparedBy: string;
  checkedBy: string;
  users: UserFormData[];
  usersRefer: { id: string; name: string; section: string; email: string }[];
  ITApprovers: { englishName: string; email: string }[];
}


export interface PendingDoc {
  Id: number;
  CreatedAt: string | Date;
  Department: string;
  ApplicantName: string;
  ApplicantPhone: string;
  Purpose: string;
  PreparedBy: string;
  CheckedBy: string | null;
  ITPreparedBy: string | null;
  ITCheckedBy: string | null;
  ITVerifiedBy: string | null;
  ITApprovedBy: string | null;
  RequestCheckedStatus: string;
  ITPreparedStatus: string;
  ITCheckedStatus: string;
  ITVerifiedStatus: string;
  ITApprovedStatus: string;
  OverallStatus: string;
  Info: string;
  RequestCheckedDate: string | Date | null;
  ITPreparedDate: string | Date | null;
  ITCheckedDate: string | Date | null;
  ITVerifiedDate: string | Date | null;
  ITApprovedDate: string | Date | null;
  OverallBy: string | null;
  OverallDate: string | Date | null;
  Users?: any[]; 
  usersRefer?: any[]; 
}

export interface Section {
  sectid: number;
  SectionCode: string;
}

export interface Employee {
  empId: number;
  employeeCode: string;
  englishName: string;
  sectionName: string;
  position?: string;
  email: string;
}



@Injectable({
    providedIn: 'root'
})

export class FormService {
    private apiUrl = 'http://localhost:3000/api';
    constructor(private http: HttpClient) {}

    // Submit form data to server
    submitForm(formData: FormSubmission): Observable<{ success: boolean; message: string; data: { id: number; createdAt: string } }> {
      return this.http.post<{ success: boolean; message: string; data: { id: number; createdAt: string } }>(`${this.apiUrl}/submit-form`, formData).pipe(
        catchError(this.handleError)
      );
    }

    // Fetch section service
    getSections(): Observable<Section[]> {
      return this.http.get<{ success: boolean; data: Section[] }>(`${this.apiUrl}/sections`).pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
    }

    // Fetch Employee
    getEmployees(): Observable<Employee[]> {
      return this.http.get<{ success: boolean; data: Employee[] } >(`${this.apiUrl}/employees`).pipe(
        map(response => response.data),
        catchError(this.handleError)
      )
    }

    // Fetch pending documents
    getPendingDocs(): Observable<{ success: boolean; data: PendingDoc[]; count: number }> {
        return this.http.get<{ success: boolean; data: PendingDoc[]; count: number }>(`${this.apiUrl}/pending-docs`).pipe(
        catchError(this.handleError)
        );
    }
    // Fetch history documents (Approved)
    getHistoryDocs(): Observable<{ success: boolean; data: PendingDoc[]; count: number }> {
      return this.http.get<{ success: boolean; data: PendingDoc[]; count: number }>(`${this.apiUrl}/history-docs`).pipe(
      catchError(this.handleError)
      );
  }



    // Fetch single form by ID
    getEmployeeById(employeeCode: string): Observable<Employee> {
      return this.http.get<Employee>(`${this.apiUrl}/employee/${employeeCode}`);
    }

    // Update approval status 
    updateApproval(id: number, statusData: { status: string; approver: string; section: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/forms/${id}/approve`, statusData).pipe(
        catchError(this.handleError)
        );
    }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status}\nMessage: ${error.error.message || 'No message provided'}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}