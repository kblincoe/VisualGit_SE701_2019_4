import { Injectable } from "@angular/core";

@Injectable()
export class DiffService {

    private currentFile: string;

    public get CurrentFile() {
        return this.currentFile;
    }

    public openFile = (fileLocation: string) => {
        this.currentFile = fileLocation;
    }
}
