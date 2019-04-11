import { Component, OnInit, OnDestroy, NgZone } from "@angular/core";
import { FileService } from "../../services/file.service";
import { ModifiedFile } from "../../modifiedFile";
import { addAndCommit } from "../../misc/git";
import { Subscription, Observable } from "rxjs";
import { PopupService } from "../../services/popup/popup.service";

@Component({
    selector: "file-panel",
    templateUrl: "./file.panel.component.html"
})

export class FilePanelComponent implements OnInit, OnDestroy {

    private static readonly POLLING_INTERVAL = 3000;

    private modifiedFiles: ModifiedFile[] = [];
    private selectedFileIndex: number = -1;
    private modifiedFilesSubscription: Subscription;
    private updateInterval: Observable<number>;
    private updateIntervalSubscription: Subscription;

    constructor (private fileService: FileService, private zone: NgZone, private popupService: PopupService){ }

    ngOnInit(): void {
        this.updateInterval = Observable.interval(FilePanelComponent.POLLING_INTERVAL);
        this.updateIntervalSubscription = this.updateInterval.subscribe(() => {

            this.fileService.getModifiedFilesPromise().then((modifiedFiles) => {
                
                if (modifiedFiles === undefined) {
                    console.log("Modified files is undefined");
                    this.popupService.showInfo("Error occurred when attempting to find modified files");
                }

                this.zone.run(() => {
                    // keep existing files unchanged, delete files do not exist anymore, and add new modified files
                    // Reassignment of the whole array was tried, but during assignment, the checked property
                    // of the elements are locked, resulting in a short period of time checkbox unresponsive
                    for (let i = 0; i < this.modifiedFiles.length; i++){
                        if (!modifiedFiles.some(file => this.modifiedFiles[i].filePath == file.filePath)) {
                            this.modifiedFiles.splice(i, 1);
                        }
                    }
                    modifiedFiles.forEach((modifiedFile) => {
                        if (!this.modifiedFiles.some(file => modifiedFile.filePath == file.filePath)) {
                            this.modifiedFiles.push(modifiedFile);
                        }
                    });
                });
            });
        });
    }

    public addAndCommit() {
        addAndCommit(this.modifiedFiles.filter(file => file.checked));
    }

    fileTrackBy(index, item){
        return item.filePath;
    }

    checkAll(event) {
        this.modifiedFiles.forEach(file => file.checked = event.target.checked)
    }

    isAllChecked() {
        return this.modifiedFiles.length === 0 ? false : this.modifiedFiles.every(file => file.checked);
    }

    ngOnDestroy() {
        this.modifiedFilesSubscription.unsubscribe();
        this.updateIntervalSubscription.unsubscribe();
    }

    // Refactor this to be coupled to the diff panel component instead of services
    fileOnClick(event, modifiedFile, i) {
        this.selectedFileIndex = (this.selectedFileIndex === i) ? -1 : i;
        
        if(!event.target.className.includes("checkbox")) {
            this.fileService.toggleDiffPanelForFile(modifiedFile);
        }
    }
}
