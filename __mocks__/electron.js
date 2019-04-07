// __mocks__/nodegit.js
'use strict';

// some customized mock functions goes here
var ipcRenderer = {
    on: jest.fn()
};

module.exports = [
    ipcRenderer
];
