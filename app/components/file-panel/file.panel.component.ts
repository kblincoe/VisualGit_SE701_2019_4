import { Component, OnInit, ViewChild, OnDestroy, NgZone } from "@angular/core";
import { FileService } from "../../services/file.service";
import { ModifiedFile } from "../../modifiedFile";
import { addAndCommit } from "../../misc/git";
import { Subscription, Observable } from "rxjs";


@Component({
    selector: "file-panel",
    templateUrl: "./file.panel.component.html"
})

export class FilePanelComponent implements OnInit, OnDestroy {

    private interval;
    modifiedFiles: ModifiedFile[] = [];
    selectedFileIndex: number = -1;
    private modifiedFilesSubscription: Subscription;
    private updateInterval: Observable<number>;
    private updateIntervalSubscription: Subscription;

    constructor (private fileService: FileService, private zone:NgZone){ }

    ngOnInit(): void {
        this.modifiedFilesSubscription = this.fileService.modifiedFiles.subscribe((modifiedFiles) => {
            // run the update of the modifiedFiles within the angular zone to make the update live on view
            this.zone.run(() => {
                // keep existing files unchanged, delete files do not exist anymore, and add new modified files
                // Reassignment of the whole array was tried, but during assignment, the checked property
                // of the elements are locked, resulting in a short period of time checkbox unresponsive
                for (let i = 0; i < this.modifiedFiles.length; i++){
                    if (!modifiedFiles.some(file => this.modifiedFiles[i].filePath == file.filePath)){
                        this.modifiedFiles.splice(i, 1);
                    }
                }
                modifiedFiles.forEach((modifiedFile) => {
                    if (!this.modifiedFiles.some(file => modifiedFile.filePath == file.filePath)){
                        this.modifiedFiles.push(modifiedFile);
                    }
                });
            });
        });
        this.updateInterval = Observable.interval(3000);
        this.updateIntervalSubscription = this.updateInterval.subscribe(() => this.fileService.updateModifiedFiles());
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
        // clearInterval(this.interval);
    }

    fileOnClick(event, modifiedFile, i) {
        this.selectedFileIndex = (this.selectedFileIndex === i) ? -1 : i;
        
        if(!event.target.className.includes("checkbox")) {
            this.fileService.toggleDiffPanel(modifiedFile);
        }
    }

    public addAndCommit() {
        addAndCommit(this.modifiedFiles.filter(file => file.checked));
    }

}
