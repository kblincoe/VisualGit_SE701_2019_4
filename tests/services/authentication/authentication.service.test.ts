require("reflect-metadata");
import { AuthenticationService } from "../../../app/services/authentication/authentication.service";
import { UserService } from "../../../app/services/user/user.service";
let github = require("octonode");

describe("Service: Authenticate", () => {
    beforeAll(() => {
        this.mockGitHubClient = github.client().me();
    });

    beforeEach(() => {
        this.userService = new UserService();
        jest.spyOn(this.userService, "logIn").mockImplementation(() => {});
        this.service = new AuthenticationService(this.userService);
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

            done();
        });
    });

    it("should fail to login when credentials are incorrect", (done) => {
        jest.spyOn(this.mockGitHubClient, "info").mockImplementation((callback: any) => {
            callback("error", undefined, undefined);
        });

        this.service.logIn("username", "password")
        .then((data) => {
            fail();
        })
        .catch((error) => {
            expect(error).toBeTruthy();
            expect(this.mockGitHubClient.info).toHaveBeenCalled();
            done();
        });
    });
});
