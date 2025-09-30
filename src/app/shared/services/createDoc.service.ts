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
        name: 'Request Create new Email Account',
        isDirectory: false,
         
      },
      {
        name: 'Passwords.rtf',
        isDirectory: false,
        
      },
    ],
  }, {
    name: 'Infrasturcture',
    isDirectory: true,
    size: 1024,
  }, {
    name: 'Security',
    isDirectory: true,
    size: 2048,
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