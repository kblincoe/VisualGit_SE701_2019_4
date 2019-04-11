import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class FileAndDiffPanelCommunicationService {

  private componentMethodInvocationSource = new Subject<any>();

  modifiedFileSent$ = this.componentMethodInvocationSource.asObservable();

  public sendModifiedFile(data: any) {
    this.componentMethodInvocationSource.next(data);
  }
  
}