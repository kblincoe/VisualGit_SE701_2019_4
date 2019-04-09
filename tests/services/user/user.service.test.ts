require("reflect-metadata");
import { UserService } from "../../../app/services/user/user.service";
let github = require("octonode");

describe("Services: User", () => {
    beforeAll(() => {
        this.mockGitHubClient = github.client().me();
    });

    beforeEach(() => {
        this.userService = new UserService();

        jest.spyOn(this.userService, 'logIn').mockImplementation(async () => {
            this.userService.username = "test_username";
            this.userService.gitHubClient = this.mockGitHubClient;
        });

        this.userService.logIn();
    });

    afterEach(() => {
        this.userService = null;
    });

    it("should successfully have an user image url", (done) => {
        jest.spyOn(this.mockGitHubClient, "info").mockImplementation((callback: any) => {
            callback(undefined, {'avatar_url': "http://test.url.org"}, undefined);
        });

        this.userService.retrieveUserAvatar();

        expect(this.userService.userAvatarUrl === "http://test.url.org").toBeTruthy();
        expect(this.userService.userAvatarUrl === "http://another.url.org").toBeFalsy();
        expect(this.mockGitHubClient.info).toHaveBeenCalled();

        done();
    });

    it("should fail to retrieve an user image url", (done) => {
        jest.spyOn(this.mockGitHubClient, "info").mockImplementation((callback: any) => {
            callback("Error: Not found", undefined, undefined);
        });

        this.userService.retrieveUserAvatar()
        .then((data) => {
            fail();
        })
        .catch((error) => {
            expect(error).toBeTruthy();
        });

        expect(this.userService.userAvatarUrl === "").toBeTruthy();
        expect(this.userService.userAvatarUrl === "http://i.shouldnt.be/set").toBeFalsy();
        expect(this.mockGitHubClient.info).toHaveBeenCalled();

        done();
    });
});