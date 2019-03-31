import * as github from "octonode";
import "reflect-metadata";
import { AuthenticationService } from "./authentication.service";

describe("Service: Authenticate", () => {
    beforeAll(() => {
        this.mockGitHubClient = github.client().me();
    });

    beforeEach(() => {
        this.service = new AuthenticationService();
        jest.spyOn(this.service, "createGitHubClient").mockReturnValue(this.mockGitHubClient);
    });

    afterEach(() => {
        this.service = null;
    });

    it("should successfully login when credentials are correct", (done) => {
        jest.spyOn(this.mockGitHubClient, "info").mockImplementation((callback: any) => {
            callback(undefined, undefined, undefined);
        });

        this.service.logIn("username", "password").then((resolve, reject) => {
            expect(resolve).toBeTruthy();
            expect(reject).toBeFalsy();
            expect(this.mockGitHubClient.info).toHaveBeenCalled();
            expect(this.service.loggedIn).toEqual(true);
            expect(this.service.user).toEqual("username");

            done();
        });
    });

    it("should fail to login when credentials are incorrect", (done) => {
        jest.spyOn(this.mockGitHubClient, "info").mockImplementation((callback: any) => {
            callback("error", undefined, undefined);
        });

        this.service.logIn("username", "password").catch((error) => {
            expect(error).toBeTruthy();
            expect(this.mockGitHubClient.info).toHaveBeenCalled();
            expect(this.service.loggedIn).toEqual(false);
            expect(this.service.user).toEqual("");

            done();
        });
    });
});
