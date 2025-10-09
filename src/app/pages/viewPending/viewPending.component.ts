import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import { FormService, PendingDoc } from 'src/app/shared/services/request-email-form.service';

@Component({
  selector: 'app-view-pending',
  templateUrl: './viewPending.component.html',
  styleUrls: ['./viewPending.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, DxDataGridModule, DxButtonModule]
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

  constructor(private formService: FormService) {}

  ngOnInit(): void {
    this.loadPendingDocs();
  }

  loadPendingDocs(): void {
    this.loading = true;
    this.error = null;

    this.formService.getPendingDocs().subscribe({
      next: (response) => {
        if (response && response.success) {
          this.pendingDocs = response.data.map(doc => ({
            ...doc,
            RequestCheckedStatus: doc.RequestCheckedStatus || 'Pending',
            ITPreparedStatus: doc.ITPreparedStatus || 'Pending',
            ITCheckedStatus: doc.ITCheckedStatus || 'Pending',
            ITVerifiedStatus: doc.ITVerifiedStatus || 'Pending',
            ITApprovedStatus: doc.ITApprovedStatus || 'Pending',
            OverallStatus: doc.OverallStatus || 'Pending',
            Users: doc.Users || [],
            usersRefer: doc.usersRefer || []
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
  this.openPreview(e); // Reuse openPreview with the row click event
}

  openPreview(e: any): void {
    console.log('openPreview triggered with event:', e);
    const doc = e.row?.data || e.data;
    if (doc) {
      this.selectedDoc = doc;
      this.isPreviewOpen = true;
      console.log('Preview opened for form ID:', doc.Id, 'Data:', doc);
    } else {
      console.error('No document data found in event:', e);
    }
  }
  closePreview(): void {
    this.isPreviewOpen = false;
    this.selectedDoc = null;
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