// src/app/pages/tasks/tasks.component.ts
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxDataGridComponent, DxButtonModule } from 'devextreme-angular';
import { firstValueFrom } from 'rxjs';
import { FormService, PendingDoc } from 'src/app/shared/services/request-email-form.service';

@Component({
  templateUrl: './tasks.component.html',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxButtonModule],
})
export class TasksComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent;
  dataSource: PendingDoc[] = [];
  statusOptions: any[];
  isPreviewOpen = false;
  selectedDoc: PendingDoc | null = null;

  constructor(private formService: FormService, private cdr: ChangeDetectorRef) {
    this.statusOptions = [
      { name: 'Pending', value: 'Pending' },
      { name: 'Approved', value: 'Approved' },
      { name: 'Rejected', value: 'Rejected' },
    ];
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
    if (this.dataGrid) {
      this.dataGrid.instance.refresh();
      this.cdr.detectChanges(); 
    }
  }

  async loadData(): Promise<void> {
    try {
      const response = await firstValueFrom(this.formService.getHistoryDocs());
      console.log('API Response:', response);
      if (response && response.success) {
        this.dataSource = response.data.map(doc => ({
          ...doc,
          RequestCheckedStatus: doc.RequestCheckedStatus || 'Pending',
          ITPreparedStatus: doc.ITPreparedStatus || 'Pending',
          ITCheckedStatus: doc.ITCheckedStatus || 'Pending',
          ITVerifiedStatus: doc.ITVerifiedStatus || 'Pending',
          ITApprovedStatus: doc.ITApprovedStatus || 'Pending',
          OverallStatus: doc.OverallStatus || 'Approved',
          Users: doc.Users || [],
          usersRefer: doc.usersRefer || [],
        }));
        console.log('DataGrid Data:', this.dataSource);
      } else {
        this.dataSource = [];
        console.warn('No data returned from API');
      }
    } catch (error) {
      console.error('Error loading approved docs:', error);
      this.dataSource = [];
    }
    this.cdr.detectChanges();
  }

  onRowClick(e: any): void {
    console.log('Row clicked:', e.data);
    this.openPreview(e);
  }


  openPreview(e: any): void {
    const doc = e.row?.data || e.data;
    if (doc) {
      this.selectedDoc = doc;
      this.isPreviewOpen = true;
      console.log('Preview opened for form ID:', doc.Id, 'Data:', doc);
    } else {
      console.error('No document data found in event:', e);
    }
    this.cdr.detectChanges(); 
  }

  closePreview(): void {
    this.isPreviewOpen = false;
    this.selectedDoc = null;
    console.log('Preview closed');
    this.cdr.detectChanges();
  }

  getStatusColor(status: string | undefined): string {
    const statusLower = status?.toLowerCase() || 'pending';
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'approved':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  isAnyClassificationChange(): boolean {
    return this.selectedDoc?.Users?.some(user => user.classification === 'Change') || false;
  }
}