import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DxDataGridModule, DxButtonModule, DxTextAreaModule } from 'devextreme-angular';
import { FormService, PendingDoc } from 'src/app/shared/services/request-email-form.service';
import { jwtDecode } from 'jwt-decode';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-approval-doc',
  templateUrl: './approvalDoc.component.html',
  styleUrls: ['./approvalDoc.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, DxDataGridModule, DxButtonModule, DxTextAreaModule, FormsModule]
})
export class ApprovalComponent implements OnInit {
  pendingDocs: PendingDoc[] = [];
  loading = true;
  error: string | null = null;
  totalCount = 0;
  isPreviewOpen = false;
  selectedDoc: PendingDoc | null = null;
  statusOptions = [
    { name: 'Pending', value: 'Pending' },
    { name: 'Approved', value: 'Approved' },
    { name: 'Rejected', value: 'Rejected' }
  ];
  userData: any = null;
  currentEmpId: string | null = null;
  currentEmail: string | null = null;
  comment: string = '';
  isApprover: boolean = false;
  currentApprId: number | null = null;
  approvalComments: { [key: number]: string | null } = {
    16: null,
    17: null,
    18: null,
    19: null,
    20: null
  };

  constructor(
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        this.userData = jwtDecode(token);
        console.log('Raw JWT token:', token);
        console.log('Decoded user data:', this.userData);
        this.currentEmpId = this.userData['Employee Code'] || null;
        this.currentEmail = this.userData['Email']?.toLowerCase() || null;
        console.log('Current EmpId:', this.currentEmpId, 'Current Email:', this.currentEmail);

        if (!this.currentEmpId) {
          this.error = 'Invalid Employee Code in token';
          console.error('Invalid or missing EmpId:', this.currentEmpId);
          this.router.navigate(['/login']);
          return;
        }

        if (!this.currentEmail) {
          this.error = 'User email not found in token';
          this.router.navigate(['/login']);
          return;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        this.error = 'Please log in to continue';
        this.router.navigate(['/login']);
        return;
      }
    } else {
      this.error = 'Please log in to continue';
      this.router.navigate(['/login']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      const reqId = parseInt(params['reqId']);
      const empId = params['empId'];
      console.log('reqId and empId from URL:', { reqId, empId });
      if (reqId && empId) {
        
        if (empId !== this.currentEmpId) {
          this.error = 'Unauthorized: Employee ID mismatch';
          this.loading = false;
          console.error('EmpId mismatch:', { urlEmpId: empId, currentEmpId: this.currentEmpId });
          return;
        }
        this.validateAndLoadRequest(reqId);
      } else {
        this.loadApprovalDocs();
      }
    });
  }

  validateAndLoadRequest(reqId: number): void {
    this.loading = true;
    this.error = null;

    this.formService.checkApprover( this.currentEmpId!).pipe(
      map(response => {
        console.log('checkApprover response:', response);
        if (!response.success || !response.isApprover) {
          throw new Error(response.message || 'You are not authorized to approve this request');
        }
        return response;
      }),
      catchError(err => {
        this.error = err.message || 'Failed to validate approver';
        this.loading = false;
        return of(null);
      })
    ).subscribe(() => {
      this.formService.getApprovalDocs(this.currentEmpId!).pipe(
        map(response => {
          console.log('getApprovalDocs response:', response);
          if (!response.success) {
            throw new Error((response as any).message || 'Failed to load requests');
          }
          const data = Array.isArray(response.data) ? response.data : [response.data];
          const doc = data.find((d: PendingDoc) => d.Id === reqId);
          if (!doc) {
            throw new Error('Request not found');
          }
          return doc;
        }),
        catchError(err => {
          console.error('Error loading request:', err);
          this.error = err.message || 'Failed to load request';
          this.loading = false;
          return of(null);
        })
      ).subscribe(doc => {
        if (doc) {
          this.selectedDoc = {
            ...doc,
            RequestCheckedStatus: doc.RequestCheckedStatus || 'Pending',
            ITPreparedStatus: doc.ITPreparedStatus || 'Pending',
            ITCheckedStatus: doc.ITCheckedStatus || 'Pending',
            ITVerifiedStatus: doc.ITVerifiedStatus || 'Pending',
            ITApprovedStatus: doc.ITApprovedStatus || 'Pending',
            OverallStatus: doc.OverallStatus || 'Pending',
            RequestCheckedDate: doc.RequestCheckedDate || null,
            ITPreparedDate: doc.ITPreparedDate || null,
            ITCheckedDate: doc.ITCheckedDate || null,
            ITVerifiedDate: doc.ITVerifiedDate || null,
            ITApprovedDate: doc.ITApprovedDate || null,
            OverallDate: doc.OverallDate || null,
            Users: doc.Users || [],
            usersRefer: doc.usersRefer || [],
            ITRefer: doc.ITRefer || [],
            ApprovalStatus: doc.ApprovalStatus || []
          };
          this.isPreviewOpen = true;
          this.setApprovalComments();
          this.checkCurrentApprover(reqId);
          console.log('Request loaded:', this.selectedDoc);
          // Debug: Log ApprovalStatus, usersRefer, and ITRefer
          console.log('ApprovalStatus:', this.selectedDoc.ApprovalStatus);
          console.log('usersRefer:', this.selectedDoc.usersRefer);
          console.log('ITRefer:', this.selectedDoc.ITRefer);
        }
        this.loading = false;
      });
    });
  }

  loadApprovalDocs(): void {
    this.loading = true;
    this.error = null;

    if (!this.currentEmpId) {
      this.error = 'Employee ID is missing';
      this.loading = false;
      console.error('No EmpId provided for loadApprovalDocs');
      return;
    }

    console.log('Fetching approval docs for EmpId:', this.currentEmpId);
    this.formService.getApprovalDocs(this.currentEmpId).subscribe({
      next: (response) => {
        console.log('getApprovalDocs response:', response);
        if (response && response.success) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.pendingDocs = data.map(doc => ({
            ...doc,
            RequestCheckedStatus: doc.RequestCheckedStatus || 'Pending',
            ITPreparedStatus: doc.ITPreparedStatus || 'Pending',
            ITCheckedStatus: doc.ITCheckedStatus || 'Pending',
            ITVerifiedStatus: doc.ITVerifiedStatus || 'Pending',
            ITApprovedStatus: doc.ITApprovedStatus || 'Pending',
            OverallStatus: doc.OverallStatus || 'Pending',
            RequestCheckedDate: doc.RequestCheckedDate || null,
            ITPreparedDate: doc.ITPreparedDate || null,
            ITCheckedDate: doc.ITCheckedDate || null,
            ITVerifiedDate: doc.ITVerifiedDate || null,
            ITApprovedDate: doc.ITApprovedDate || null,
            OverallDate: doc.OverallDate || null,
            Users: doc.Users || [],
            usersRefer: doc.usersRefer || [],
            ITRefer: doc.ITRefer || [],
            ApprovalStatus: doc.ApprovalStatus || []
          }));
          this.totalCount = response.count || this.pendingDocs.length;
          console.log('Approval docs loaded:', this.pendingDocs);
        } else {
          this.pendingDocs = [];
          this.totalCount = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load approval documents';
        this.loading = false;
        this.pendingDocs = [];
        this.totalCount = 0;
        console.error('Error loading approval docs:', err);
      }
    });
  }

  checkCurrentApprover(reqId: number): void {
    this.formService.checkApprover( this.currentEmpId!).subscribe({
      next: (response) => {
        this.isApprover = response.isApprover;
        if (response.isApprover) {
          const pendingStep = this.selectedDoc?.ApprovalStatus?.find(
            status => status.Status === 'Pending' && String(status.EmpId) === this.currentEmpId
          );
          this.currentApprId = pendingStep ? pendingStep.appr_id : null;
          console.log('Current approver check:', { isApprover: this.isApprover, currentApprId: this.currentApprId });
        }
      },
      error: (err) => {
        console.error('Error checking approver:', err);
        this.isApprover = false;
        this.currentApprId = null;
      }
    });
  }

  setApprovalComments(): void {
    if (this.selectedDoc && this.selectedDoc.ApprovalStatus) {
      [16, 17, 18, 19, 20].forEach(apprId => {
        const status = this.selectedDoc!.ApprovalStatus!.find(s => s.appr_id === apprId);
        this.approvalComments[apprId] = status ? status.Comment : null;
      });
    } else {
      this.approvalComments = { 16: null, 17: null, 18: null, 19: null, 20: null };
    }
  }

submitApproval(action: 'Approved' | 'Rejected'): void {
  if (!this.selectedDoc || !this.currentEmpId || !this.isApprover) {
    this.error = 'Cannot submit approval: Invalid request or unauthorized';
    console.error('submitApproval failed: Invalid state', {
      selectedDoc: this.selectedDoc,
      currentEmpId: this.currentEmpId,
      isApprover: this.isApprover
    });
    return;
  }

  if (action === 'Rejected' && !this.comment.trim()) {
    this.error = 'Comment is required for Reject action';
    console.warn('Reject attempted without comment');
    return;
  }

  const data = {
    reqId: this.selectedDoc.Id,
    empId: this.currentEmpId,
    action,
    comment: this.comment || undefined
  };

  console.log('Submitting approval:', data);

  this.formService.submitApproval(data).subscribe({
    next: (response) => {
      console.log('Approval submitted:', response);
      if (response.success) {
        this.closePreview();
        this.loadApprovalDocs();
        this.comment = '';
        this.error = null;
        // Optional: Handle session termination for Reject
        if (action === 'Rejected') {
          console.log('Reject action: Terminating session');
          // localStorage.removeItem('authToken');
          this.router.navigate(['/home']);
        }
      } else {
         this.closePreview();
        this.loadApprovalDocs();
      }
    },
    error: (err) => {
      console.error('Error submitting approval:', err);
      if (err.status === 500) {
        this.error = 'Server error: Unable to process approval due to a database issue. Please contact IT support.';
      } 
    }
  });
}

  onRowClick(e: any): void {
    console.log('Row clicked:', e.data);
    this.openPreview(e);
  }

  openPreview(e: any): void {
    console.log('openPreview triggered with event:', e);
    const doc = e.row?.data || e.data;
    if (doc) {
      this.selectedDoc = doc;
      this.isPreviewOpen = true;
      this.setApprovalComments();
      this.checkCurrentApprover(doc.Id);
      console.log('Preview opened for form ID:', doc.Id, 'Data:', doc);
    } else {
      console.error('No document data found:', { doc });
    }
  }

  closePreview(): void {
    this.isPreviewOpen = false;
    this.selectedDoc = null;
    this.comment = '';
    this.isApprover = false;
    this.currentApprId = null;
    this.approvalComments = { 16: null, 17: null, 18: null, 19: null, 20: null };
    this.router.navigate([], { queryParams: {} });
    console.log('Preview closed');
  }

  refresh(): void {
    this.loadApprovalDocs();
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-200 text-yellow-800';
      case 'approved': return 'bg-green-200 text-green-800';
      case 'rejected': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  }

  isAnyClassificationChange(): boolean {
    if (!this.selectedDoc?.Users) {
      return false;
    }
    return this.selectedDoc.Users.some(user => user.classification === 'Change');
  }

  getIdDisplay(user: any): string {
    return user.classification === 'Change'
      ? `${user.idBeforeChange || 'N/A'} → ${user.idAfterChange || 'N/A'}`
      : user.id || 'N/A';
  }

  getSexDisplay(user: any): string {
    const sexMap: { [key: string]: string } = { 'M': 'Male', 'F': 'Female' };
    if (user.classification === 'Change') {
      const before = sexMap[user.sexBeforeChange] || 'N/A';
      const after = sexMap[user.sexAfterChange] || 'N/A';
      return `${before} → ${after}`;
    }
    return sexMap[user.sex] || 'N/A';
  }

  getFirstNameDisplay(user: any): string {
    return user.classification === 'Change'
      ? `${user.firstNameBeforeChange || 'N/A'} → ${user.firstNameAfterChange || 'N/A'}`
      : user.firstName || 'N/A';
  }

  getFamilyNameDisplay(user: any): string {
    return user.classification === 'Change'
      ? `${user.familyNameBeforeChange || 'N/A'} → ${user.familyNameAfterChange || 'N/A'}`
      : user.familyName || 'N/A';
  }

  getSectionDisplay(user: any): string {
    return user.classification === 'Change'
      ? `${user.sectionBeforeChange || 'N/A'} → ${user.sectionAfterChange || 'N/A'}`
      : user.section || 'N/A';
  }

  getPositionDisplay(user: any): string {
    return user.classification === 'Change'
      ? `${user.positionBeforeChange || 'N/A'} → ${user.positionAfterChange || 'N/A'}`
      : user.position || 'N/A';
  }
}