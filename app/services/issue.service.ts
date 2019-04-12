import { Injectable } from "@angular/core";
let github = require("octonode");

@Injectable()
export class IssueService {
    private gitHubClient: any;
    public repoName: string;
    private repoInfo: any;

    // Only for testing purposes
    public ReturnRepoInfo(): any {
        return this.repoInfo;
    }

    // Only for testing purposes
    public ReturnGitHubClient(): any {
        return this.gitHubClient;
    }

    // Only for testing purposes
    public SetRepoInfo(repoInfo: any) {
        this.repoInfo = repoInfo;
    }

    // Only for testing purposes
    public SetGitHubClient(gitHubClient: any) {
        this.gitHubClient = gitHubClient;
    }

    public InitializeGitHubClient(username: string, password: string): void {
        this.gitHubClient = github.client({ username, password });
    }

    public InitializeRepo(repo: string) {
        this.repoName = repo.replace("https://github.com/", "");
        this.repoInfo = this.gitHubClient.repo(this.repoName);
    }

    public GetAnIssue(issueNumber: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const gitHubIssue = this.returnGitHubIssue(issueNumber);
            gitHubIssue.info((error, data, headers) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data)
                }
            });
        });
    }

    public returnGitHubIssue(issueNumber: number): any {
        return this.gitHubClient.issue(this.repoName, issueNumber);
    }

    public GetIssues(numberOfIssues: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.repoInfo.issues({
                page: 1,
                per_page: numberOfIssues,
                state: 'open'
            }, function (err, body) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(body);
                }
            });
        });
    }

}