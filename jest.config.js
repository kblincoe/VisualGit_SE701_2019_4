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
        "nodegit": "<rootDir>/tests/__mocks__/nodegit",
        "electron": "<rootDir>/tests/__mocks__/electron.js"
    }
}
