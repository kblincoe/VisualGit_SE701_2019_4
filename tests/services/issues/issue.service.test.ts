require("reflect-metadata");
import { IssueService } from "../../../app/services/issue.service";
let github = require("octonode");

describe("Service: Issue", () => {
    beforeAll(() => {
        this.mockGitHubClient = github.client();
        this.mockGitHubClientIssue = github.client().issue();
        this.mockGitHubClientRepo = github.client().repo();
    });

    beforeEach(() => {
        this.issueService = new IssueService();
        jest.spyOn(this.issueService, "returnGitHubIssue").mockReturnValue(this.mockGitHubClientIssue);
        this.issueService.SetRepoInfo(this.mockGitHubClientRepo);
        this.issueService.SetGitHubClient(this.mockGitHubClient);
    });

    afterEach(() => {
        this.issueService = null;
    });

    it("should successfully initialize repo", (done) => {
        this.issueService.InitializeRepo("https://github.com/kblincoe/VisualGit_SE701_2019_4");
        expect(this.issueService.ReturnRepoInfo()).toEqual(expect.not.stringContaining("https://github.com/"));
        expect(this.issueService.ReturnRepoInfo()).toEqual(this.mockGitHubClient.repo(this.issueService.repoName));
        done();
    });

    it("should successfully initialize GitHub client", (done) => {
        this.issueService.InitializeGitHubClient("username", "password");
        const username = "username";
        const password = "password";
        expect(this.issueService.ReturnGitHubClient().token).toEqual(github.client({username, password}).token);
        done();
    });

    it("should successfully get an issue when repo is valid", (done) => {
        jest.spyOn(this.mockGitHubClientIssue, "info").mockImplementation((callback: any) => {
            callback(undefined, "issue", undefined);
        });

        this.issueService.GetAnIssue(37).then((resolve, reject) => {
            expect(resolve).toBeTruthy();
            expect(reject).toBeFalsy();
            expect(this.mockGitHubClientIssue.info).toHaveBeenCalled();
            done();
        });
    });

    it("should fail to get an issue when repo is invalid", (done) => {
        jest.spyOn(this.mockGitHubClientIssue, "info").mockImplementation((callback: any) => {
            callback("error", undefined, undefined);
        });

        this.issueService.GetAnIssue(37)
            .then((data) => {
                fail();
            })
            .catch((error) => {
                expect(error).toBeTruthy();
                expect(this.mockGitHubClientIssue.info).toHaveBeenCalled();
                done();
            });
    });

    // Currently unsure how to test with private repo
    it("should successfully get multiple issues when repo is valid", (done) => {
        this.issueService.InitializeRepo("https://github.com/freeCodeCamp/freeCodeCamp");

        this.issueService.GetIssues(37).then((resolve, reject) => {
            expect(resolve).toBeTruthy();
            expect(reject).toBeFalsy();
            done();
        });
    });

    it("should fail to get multiple issues when repo is invalid", (done) => {
        this.issueService.InitializeRepo("https://github.com");

        this.issueService.GetIssues(37)
            .then((data) => {
                fail();
            })
            .catch((error) => {
                expect(error).toBeTruthy();
                done();
            });
    });
});
