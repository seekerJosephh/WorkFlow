import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: './tasks.component.html',
  standalone: true,
  imports: [DxDataGridModule],
})
export class TasksComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent;
  dataSource: any;
  statusOptions: any[];

  constructor(private http: HttpClient) {
    this.dataSource = {
      store: {
        type: 'array',
        key: 'Id',
        data: [],
        onBeforeSend: (method: string, ajaxOptions: any) => {
          ajaxOptions.url = 'http://localhost:3000/api/approved-docs';
          ajaxOptions.method = 'GET';
        },
        load: async () => {
          try {
            const response = await firstValueFrom(
              this.http.get<{ success: boolean; data: any[]; count: number }>(
                'http://localhost:3000/api/approved-docs'
              )
            );
            console.log('API Response:', response);
            if (response && response.success) {
              console.log('DataGrid Data:', response.data);
              return {
                data: response.data ?? [],
                totalCount: response.count ?? 0,
              };
            }
            throw new Error('Failed to load approved documents');
          } catch (error) {
            console.error('Error loading approved docs:', error);
            throw error;
          }
        },
      },
    };

    this.statusOptions = [
      { name: 'Pending', value: 'Pending' },
      { name: 'Approved', value: 'Approved' },
      { name: 'Rejected', value: 'Rejected' },
    ];
  }

  async ngOnInit(): Promise<void> {
    await this.dataSource.store.load();
    this.dataGrid.instance.refresh(); // Force DataGrid refresh
  }
}