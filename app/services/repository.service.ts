import { Injectable } from "@angular/core";

// Used for updating modal, remove this import after refactoring repo.ts
import { updateModalText } from "../misc/repo";

let Git = require("nodegit");
let fs = require("fs-extra");
let path = require("path");

@Injectable()
export class RepositoryService {

    public getRepoName(): string {
        return "Nice Repo";
    }

    public getCurrentBranch(): string {
        return "Nice Branch";
    }

    public createRepo(fullPath: string): void {
        const fileNames = [".gitignore", "README.md"];
        const fileContent = "";
        const isBare = 0;
        let repository;
        let index;

        updateModalText("Creating a new repository...");
        fs.ensureDir(path.resolve(fullPath))
            .then(function () {
                return Git.Repository.init(path.resolve(fullPath), isBare);
            })
            .then(function (repo) {
                repository = repo;
                return Promise.all(fileNames.map(function (fileName: string) {
                    fs.writeFile(
                        path.join(repo.workdir(), fileName), fileContent);
                }));
            })
            .then(function () {
                return repository.refreshIndex();
            })
            .then(function (idx) {
                index = idx;
            })
            .then(function () {
                return index.addAll();
            })
            .then(function () {
                return index.write();
            })
            .then(function () {
                return index.writeTree();
            })
            .then(function (oid) {
                const author = repository.defaultSignature();
                const committer = repository.defaultSignature();

                // Since we're creating an inital commit, it has no parents. Note that unlike
                // normal we don't get the head either, because there isn't one yet.
                return repository.createCommit("HEAD", author, committer, "message", oid, []);
            })
            .then(function () {
                updateModalText("Created a new repository successfully");
            })
            .catch(function (err) {
                updateModalText("Failed: " + err);
                console.log(err);
            });
    }
}
