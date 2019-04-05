module.exports = {
    "roots": [
        "<rootDir>",
        "<rootDir>/tests"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "setupFiles": [ "<rootDir>/jest.setup.js" ],
    "moduleNameMapper": {
        "nodegit": "<rootDir>/__mocks__/nodegit",
        "electron": "<rootDir>/__mocks__/electron.js"
    }
}
