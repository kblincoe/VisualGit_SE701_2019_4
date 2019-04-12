require("reflect-metadata");
import { UserService } from "../../../app/services/user/user.service";
const github = require("octonode");
jest.mock("electron");
jest.mock("nodegit");

describe("Services: User Avatar", () => {
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

const TEST_EMAIL = "example@email.com";

describe("Service: User", () => {
    beforeAll(() => {
        this.userService = new UserService();
    });

    beforeEach(() => {
        this.userService = new UserService();

        jest.spyOn(this.userService, "retrieveEmail")
            .mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve(TEST_EMAIL);
                });
            });
    });

    afterEach(() => {
        this.userService = undefined;
    });

    it("should set login status after succesfully logging in", () => {
        const logInData = {
            name: "hi",
        };
        this.userService.logIn(this.githubClient, logInData, undefined).then(() => {
            expect(this.userService.username).toBe(logInData.name);
            expect(this.userService.email).toBe(TEST_EMAIL);
            expect(this.userService.loggedIn).toBeTruthy();
        });
    });

    it("should get email after logging in", (done) => {
        const logInData = {
            name: "hi",
        };
        this.userService.logIn(this.githubClient, logInData, { username: "hi"});

        expect(this.userService.retrieveEmail).toHaveBeenCalled();
        done();
    });

    it("should reset appropriate fields after logging out", (done) => {
        const logInData = {
            name: "hi",
        };
        this.userService.logIn(this.githubClient, logInData, { username: "hi" });
        this.userService.logOut();

        expect(this.userService.loggedIn).toBeFalsy();
        expect(this.userService.username).toBe("");
        expect(this.userService.email).toBe("");
        done();
    });

});
