import { Injectable } from "@angular/core";

@Injectable()
export class DiffService {

    private currentFile: string;

    constructor() {
        DiffServiceUtils.diffService = this;
    }

    public get CurrentFile() {
        return this.currentFile;
    }

    public openFile = (fileLocation: string) => {
        this.currentFile = fileLocation;
    }
}

export class DiffServiceUtils {
    public static diffService: DiffService;
}