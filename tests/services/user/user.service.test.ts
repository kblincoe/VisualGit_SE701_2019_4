require("reflect-metadata");
import { UserService } from "../../../app/services/user/user.service";
const github = require("octonode");

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

    it("should successfully have an user image url", (done) => {
        jest.spyOn(this.mockGitHubClient, "info").mockImplementation((callback: any) => {
            callback(undefined, {'avatar_url': "http://test.url.org"}, undefined);
        });

        this.userService.retrieveUserAvatar();

        expect(this.userService.userAvatarUrl).toBe("http://test.url.org");
        expect(this.userService.userAvatarUrl).not.toBe("http://another.url.org");
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

        expect(this.userService.userAvatarUrl).toBe("");
        expect(this.userService.userAvatarUrl).not.toBe("http://i.shouldnt.be/set");
        expect(this.mockGitHubClient.info).toHaveBeenCalled();

        done();
    });
});