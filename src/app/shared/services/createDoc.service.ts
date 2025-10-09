import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';

export class FileItem {
  name!: string;
  isDirectory!: boolean;
  size?: number;
  items?: FileItem[];
}

const fileItems: FileItem[] = [{
  name: 'Documents',
  isDirectory: true,
  items: [{
    name: 'Office365',
    isDirectory: true,
    items: [
      {
        name: 'QF-IFM-016 Application for Create and Delet E-mail',
        isDirectory: false,
         
      },
    ],
  }, {
    name: 'Infrasturcture',
    isDirectory: true,
    items: [
      {
        name: 'QF-IFM-007 & QF-IFM-055 IP Address Application Form',
        isDirectory: false,
      }
    ]
  }, {
    name: 'Security',
    isDirectory: true,
    items: [
     {
       name: 'QF-IFM-038 Form Report Security Incident',
      isDirectory: false,
     },
     {
      name: 'QF-IFM-019 Request for Checking Security Camera Form',
      isDirectory: false,
     },
     {
      name: 'QF-IFM-020 Adjust Location Camera Security Form',
      isDirectory: false,
     }
    ],
  }, {
    name: 'Various IT related applications',
    isDirectory: true,
    size: 3072,
  }],
}];

@Injectable()
export class Service {
  fileSelected = new EventEmitter<FileItem>();

  getFileItems(): Observable<FileItem[]> {
    return of(fileItems);
  }

  selectFile(item: FileItem) {
    if (!item.isDirectory) {
      this.fileSelected.emit(item);
    }
  }
}