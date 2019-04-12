# Welcome

An easy-to-use, visually-oriented desktop client for Git aimed at helping students learn the standard Git workflow.
You can get a summary of our project by reading our [cool poster](https://github.com/ElliotWhiley/VisualGit/raw/resources/visualgit-poster.pdf)   :)

# Installation

### Prerequisites

npm (Node Package Manager) is used to manage VisualGit's dependencies, therefore it is required to install and run VisualGit.


**Note**:  
As of 12/04/2019, VisualGit currently works with Node version 6.2.1 (and possibly most of Node version 6). It is likely that your machine will be running a much newer version of Node, and you may need to downgrade.

To downgrade your version, you can use nvm (Node Version Manager) to manage what version your system is using.

Follow the instructions below to install nvm and Node version 6.2.1:

#### Linux
Run the following command in terminal to install [nvm](https://github.com/creationix/nvm):
````
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
````

#### Mac
If you have homebrew installed, use the command:  
````
brew install nvm
````  
Otherwise download and install [nvm](https://github.com/creationix/nvm) with:  
````
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
````

#### Windows
An alternate version of [nvm windows](https://github.com/coreybutler/nvm-windows) was made for Windows. You can download it [here](https://github.com/coreybutler/nvm-windows/releases). 

### Installing node
To install node version 6.2.1, use:  
````
nvm install 6.2.1
````  

then run the following command to switch to the installed package:  
````
nvm use 6.2.1
````


## Setup
Clone with either HTTPS or SSH:

#### SSH
````
git clone git@github.com:kblincoe/VisualGit_SE701_2019_4.git
````

#### HTTPS
````
git clone https://github.com/kblincoe/VisualGit_SE701_2019_4.git
````
then run the following commands:


````
cd VisualGit_SE701_2019_4
npm install
npm run compile
npm start
````  

Please see the [Issues](#issues) section if you encounter any issues.

# Testing


#### Running Tests
To run tests for this project, run either `npm t` or `npm test`.

This will run all the tests found in the `./tests` folder.

Note: there are a few manual tests that are documented within some of the PR's.

#### Adding Tests

Custom tests should have `.test` added to the end of it's name. 

i.e. a test for `user.service.ts` should be named `user.service.test.ts`

Any additional tests that you want to add to the project should go in the `./tests` folder. This folder should mimic the structure of the `./app` folder.  

For example, if you want to add tests for the `./app/services/repository.service.ts` file, you should place your tests in `./tests/services/repository.service.test.ts`


# Packaging the App
To package the app, run the `npm run compile` command, and then the following commands depending on your OS:

#### Mac
`npm run package-mac`

#### Linux
`npm run package-linux`

#### Windows
`npm run package-win`

These commands should generate a package under the `./releases/` folder.

# Issues

While compiling the project, you may come across a lot of errors in the console. <Just close your eyes and hope they go away>These are safe to ignore and the project should still compile.

When you run the project with the `npm start` command, you may come across a blank white screen. This is caused by an issue with nodegit and electron. To fix this, create a new `.npmrc` file in the project's root directory and add in the following lines:

````
runtime = electron
target = 1.2.8
target_arch = x64
disturl = https://atom.io/download/atom-shell
progress = true
````
Once that is added, delete the `node_modules` folder and rerun the [setup](#setup) commands.

# Development

### TypeScript
[TypeScript](https://www.typescriptlang.org/) is a statically-typed superset of JavaScript that compiles into JavaScript. Most of our source files are written in TypeScript (.ts files), therefore you will need to run a TypeScript compiler to compile the source code to JavaScript (.js files) as you make changes, e.g. [typescript-compiler](https://www.npmjs.com/package/typescript-compiler) for Node.

# Existing Features

### Opening / Cloning repositories
Repositories can be added by two methods; either by cloning the remotely hosted repository or opening it from the local file system. This is achieved using the add repository button in the top left which will update the screen to the add repository view.

#### Clone
Cloning with SSH is recommended as there is not yet any method for entering user credentials in VisualGit. This means that if you clone using HTTPS, you will still be able to see local changes and commit locally but not push.

#### Open local repository
Currently, when you clone a repository, it is saved to a directory under `./VisualGit/`. This means that when you open a repository which is saved locally, you can simply enter the name of the directory relative to the VisualGit directory. Other save locations are not currently supported but it is planned in future work.

### Adding & Committing
When changes are made in a repository which is open, the interface will update by showing each file which has uncommitted changes. These changes will be displayed as a traffic light scheme:
 - Green: Added file
 - Orange: Modified file
 - Red: Deleted file

This is used to allow users to see the different types of changes easily and once they click on the files, the file differences will be shown. The file differences are shown line by line with green lines representing added lines and red representing deleted lines. Any other parts of the file are unchanged.

### Pushing & Pulling from remote
The pulling and pushing currently works for changes which are made on master and origin/master by syncing these up. When the pull button is clicked, any changes on the remote repository will be added to the local repository and the graph will be updated. When pushing, the same process applies. The changes on master will be pushed to the remote repository.

# Features We Added

#### Git init
#### Git fetch
#### Adding/Viewing Remotes
#### Webpack
#### Text Editor + line numbers + side difference
#### Help Screen
#### Themes
#### Refactored popup modals
#### New Header Icons


Please refer to the repository wiki documentation [here]( https://github.com/kblincoe/VisualGit_SE701_2019_4/wiki) for screenshots of the application.

# Contributing
We are open to pull requests with new features or improvements.

# Help
Visualgit utilises a range of libraries and frameworks, more information on them can be found below:

 - [Electron](http://electron.atom.io/)
 - [Node.js](https://nodejs.org/en/about/)
 - [AngularJS](https://angular.io/)
 - [nodegit](http://www.nodegit.org/)
 - [Vis.js](http://visjs.org/docs/network/)
 - [TypeScript](https://www.typescriptlang.org/)
 - [Bootstrap](https://getbootstrap.com)
 - [Octonode](https://github.com/pksunkara/octonode)
 - [Jest](https://jestjs.io/)

