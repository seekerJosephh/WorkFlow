import { Component, enableProdMode } from "@angular/core";
import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';
import { DxFileManagerModule  } from 'devextreme-angular/ui/file-manager';
import * as DxFileManagerTypes from 'devextreme-angular/ui/file-manager';
import { Service, FileItem } from '../../shared/services/createDoc.service';
import { AppModule } from "src/app/app.module";


if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

let modulePrefix = '';
// @ts-ignore
if (window && window.config?.packageConfigPaths) {
  modulePrefix = '/app';
}


@Component({
  templateUrl: 'createDoc.component.html',
  styleUrls: ['./createDoc.component.scss'],
  providers: [Service],
  preserveWhitespaces: true,
})



export class CreateDocComponent {
  fileItems: FileItem[] | undefined;
  showEmailFormPopup = false;

  constructor(private service: Service) {
    this.service.getFileItems().subscribe((items: FileItem[]) => {
      this.fileItems = items;
    });
  }

  onSelectedItemChanged(e: any) {
    const selectedItem = e.component.getSelectedItems()[0];
    if (selectedItem && selectedItem.name === 'About.rtf') {
      this.showEmailFormPopup = true;
    }
  }

  closePopup() {
    this.showEmailFormPopup = false;
  }

  submitEmailRequest(formValues: any) {
    this.closePopup();
  }
}



