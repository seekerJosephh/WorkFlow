import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import { FormService, PendingDoc } from 'src/app/shared/services/request-email-form.service';
import { jwtDecode } from 'jwt-decode';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-view-pending',
  templateUrl: './viewPending.component.html',
  styleUrls: ['./viewPending.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, DxDataGridModule, DxButtonModule, FormsModule]
})
export class ViewPendingComponent implements OnInit {
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
  currentEmpId: number | null = null;
  currentEmail: string | null = null;

  constructor(
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Decode JWT token to get user data
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        this.userData = jwtDecode(token);
        this.currentEmpId = parseInt(this.userData['Employee Code']) || null;
        this.currentEmail = this.userData['Email']?.toLowerCase() || null;
        console.log('Decoded user data:', this.userData);
        console.log('Current EmpId:', this.currentEmpId, 'Current Email:', this.currentEmail);
        if (!this.currentEmail || !this.currentEmpId) {
          this.error = 'User email or employee ID not found in token';
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

    // Check for query parameters from email link
    this.route.queryParams.subscribe(params => {
      const reqId = parseInt(params['reqId']);
      const empId = parseInt(params['empId']);
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
        this.loadPendingDocs();
      }
    });
  }

  validateAndLoadRequest(reqId: number): void {
    this.loading = true;
    this.error = null;

    // Fetch the specific request by reqId
    this.formService.getPendingDocs(this.currentEmpId?.toString() || 'N/A').pipe(
      map(response => {
        console.log('getPendingDocs response for reqId:', response);
        if (!response.success) {
          throw new Error((response as any).message || 'Failed to load request');
        }
        const doc = response.data.find((d: PendingDoc) => d.Id === reqId);
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
        this.selectedDoc = doc;
        this.isPreviewOpen = true;
        console.log('Request loaded:', this.selectedDoc);
      }
      this.loading = false;
    });
  }

  loadPendingDocs(): void {
    this.loading = true;
    this.error = null;

    const employeeCode = this.userData ? this.userData['Employee Code'] || 'N/A' : 'N/A';
    console.log('Fetching pending docs for Employee Code:', employeeCode);

    this.formService.getPendingDocs(employeeCode).subscribe({
      next: (response) => {
        console.log('getPendingDocs response:', response);
        if (response && response.success) {
          this.pendingDocs = response.data.map(doc => ({
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
          this.totalCount = response.count;
        } else {
          this.pendingDocs = [];
          this.totalCount = 0;
        }
        this.loading = false;
        console.log('Pending docs loaded:', this.pendingDocs);
      },
      error: (err) => {
        this.error = err.message || 'Failed to load pending documents';
        this.loading = false;
        this.pendingDocs = [];
        this.totalCount = 0;
        console.error('Error loading pending docs:', err);
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
      console.log('Preview opened for form ID:', doc.Id, 'Data:', doc);
    } else {
      console.error('No document data found:', { doc });
    }
  }

  closePreview(): void {
    this.isPreviewOpen = false;
    this.selectedDoc = null;
    this.router.navigate([], { queryParams: {} });
    console.log('Preview closed');
  }

  refresh(): void {
    this.loadPendingDocs();
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
}