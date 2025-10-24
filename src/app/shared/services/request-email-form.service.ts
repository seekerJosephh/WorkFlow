import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError, map, tap } from "rxjs";

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
  department: any;
  applicantName: string;
  applicantPhone: string;
  applicantEmpCode: string;
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
  RequestCheckedComment: string | null;
  ITPreparedComment: string | null;
  ITCheckedComment: string | null;
  ITVerifiedComment: string | null;
  ITApprovedComment: string | null;
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
  ITRefer?: any[];
  ApprovalStatus?: { appr_id: number; EmpId: number; Status: string; Comment: string | null }[];
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

export interface EmailQueueItem {
  empID: number;
  Email: string;
  In_Other_number: number;
  appr_id: number;
  status: number;
}

export interface ApprovalDocs {

}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = 'http://172.16.199.157:3000/api';

  constructor(private http: HttpClient) {}

  // Handle Submit From Service
  submitForm(formData: FormSubmission): Observable<{ success: boolean; message: string; data: { id: number; createdAt: string } }> {
    return this.http.post<{ success: boolean; message: string; data: { id: number; createdAt: string } }>(`${this.apiUrl}/submit-form`, formData).pipe(
      tap(response => console.log('submitForm response:', response)),
      catchError(this.handleError)
    );  
  }
  // Get Section From Service 
  getSections(): Observable<Section[]> {
    return this.http.get<{ success: boolean; data: Section[] }>(`${this.apiUrl}/sections`).pipe(
      tap(response => console.log('getSections response:', response)),
      map(response => response.data),
      catchError(this.handleError)
    );
  }
  // Fetch Employee Service
  getEmployees(): Observable<Employee[]> {
    return this.http.get<{ success: boolean; data: Employee[] }>(`${this.apiUrl}/employees`).pipe(
      tap(response => console.log('getEmployees response:', response)),
      map(response => response.data),
      catchError(this.handleError)
    );
  }
  // Fetch Pending Docs base Employee Login with their username
  getPendingDocs(employeeCode?: string): Observable<{ success: boolean; data: PendingDoc[]; count: number }> {
    const url = employeeCode ? `${this.apiUrl}/pending-docs?employeeCode=${encodeURIComponent(employeeCode)}` : `${this.apiUrl}/pending-docs`;
    return this.http.get<{ success: boolean; data: PendingDoc[]; count: number }>(url).pipe(
      tap(response => console.log('getPendingDocs response:', response)),
      catchError(this.handleError)
    );
  }

  // for get Approval Docs Service
  getApprovalDocs(employeeCode: string, reqId?: number): Observable<{ success: boolean; data: PendingDoc | PendingDoc[]; count?: number }> {
    let url = `${this.apiUrl}/request-details-by-employee?employeeCode=${encodeURIComponent(employeeCode)}`;

    return this.http.get<{ success: boolean; data: PendingDoc | PendingDoc[]; count?: number }>(url).pipe(
      tap(response => console.log('getApprovalDocs response:', response)),
      catchError(this.handleError)
    );
  }

  // Get History Service 
  getHistoryDocs(employeeCode?: string): Observable<{ success: boolean; data: PendingDoc[]; count: number }> {
    const url = employeeCode ? `${this.apiUrl}/history-docs?employeeCode=${encodeURIComponent(employeeCode)}` : `${this.apiUrl}/history-docs`;
    return this.http.get<{ success: boolean; data: PendingDoc[]; count: number }>(url).pipe(
      tap(response => console.log('getHistoryDocs response:', response)),
      catchError(this.handleError)
    );
  }

  getEmployeeById(employeeCode: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employee/${employeeCode}`).pipe(
      tap(response => console.log('getEmployeeById response:', response)),
      catchError(this.handleError)
    );
  }

  validateApproval(reqId: number, empId: number): Observable<{ success: boolean; message?: string; request?: PendingDoc; empId?: number }> {
    return this.http.get<{ success: boolean; message?: string; request?: PendingDoc; empId?: number }>(
      `${this.apiUrl}/approve?reqId=${reqId}&empId=${empId}`
    ).pipe(
      tap(response => console.log('validateApproval response:', response)),
      catchError(this.handleError)
    );
  }


  checkApprover(empId: string): Observable<{ success: boolean; isApprover: boolean; message?: string }> {
    const url = `${this.apiUrl}/check-approver?empId=${encodeURIComponent(empId)}`;
    return this.http.get<{ success: boolean; isApprover: boolean; message?: string }>(url).pipe(
      tap(response => console.log('checkApprover response:', response)),
      catchError(this.handleError)
    );
  }


  // Submit approval action

  submitApproval(data: { reqId: number; empId: string; action: string; comment?: string }): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/approve-action`, data).pipe(
      tap(response => console.log('submitApproval response:', response)),
      catchError(this.handleError)
    );
  }


  updateApproval(id: number, empId: number, statusData: { status: string; approver: string; section: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/forms/${id}/approve`, statusData).pipe(
      tap(response => console.log('updateApproval response:', response)),
      catchError(this.handleError)
    );
  }

  getEmailQueue(reqId: number): Observable<EmailQueueItem[]> {
    return this.http.get<{ success: boolean; data: EmailQueueItem[] }>(`${this.apiUrl}/email-queue?reqId=${reqId}`).pipe(
      tap(response => console.log('getEmailQueue response:', response)),
      map(response => response.data),
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
    console.error('Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}