import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ModifiedFile } from "../../modifiedFile";

@Injectable()
export class FileAndDiffPanelCommunicationService {

  private componentMethodInvocationSource = new Subject<ModifiedFile>();

  modifiedFileSent$ = this.componentMethodInvocationSource.asObservable();

  public sendModifiedFile(data: ModifiedFile) {
    this.componentMethodInvocationSource.next(data);
  }
  
}