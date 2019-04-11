export class ModifiedFile {
    constructor(public filePath: string, public fileModification: string, public checked: boolean) { }
    
    public isRepositoryOrFolder() : boolean {
        const lastChar = this.filePath.split("").pop();
        return (lastChar == "\\" ||  lastChar == "/");
    } 
}