let github = require('octonode');

    
export function getGithubPage(username: String) {
    window.open("https://www.github.com/"+username);
}

export function sendEmail(name: String, pass: String) {
    let client = github.client({
        username: name,
        password: pass
      });
    client.get('/user', {}, function (err, status, body, headers) {
        window.open("mailto:"+body.email);
    });
}

