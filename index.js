// Bring in environment secrets through dotenv
require('dotenv/config')

// Use the request module to make HTTP requests from Node
const request = require('request')

// Run the express app
const express = require('express')
const session = require('express-session')
const crypto = require('crypto')
const app = express()

function generatePKCE() {
    // Generate a random code_verifier
    const code_verifier = crypto.randomBytes(32).toString('hex');
    // Create a code_challenge based on the code_verifier
    const code_challenge = crypto.createHash('sha256').update(code_verifier).digest('base64url');
    return { code_verifier, code_challenge };
}

// Prototype function to convert a Base64 string to Base64Url
Buffer.prototype.base64url = function () {
    return this.toString('base64')
        .replace('+', '-')
        .replace('/', '_')
        .replace(/=+$/, '');
};

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
)

app.get('/', (req, res) => {

    // Step 1: 
    // Check if the code and state parameters are in the url 
    // if an authorization code is available and the state is valid, the user has most likely been redirected from Zoom OAuth
    // if not, the user needs to be redirected to Zoom OAuth to authorize

    if (req.query.code && req.query.state) {
        console.log('Received state:', req.query.state); // For state troubleshooting
        console.log('Stored state:', req.session.state); // For state troubleshooting
        if (req.query.state !== req.session.state) {
            res.status(403).send('Invalid state');
            return;
        }

        // Step 3: 
        // Request an access token using the auth code

        // Use the code_verifier stored in the session
        const code_verifier = req.session.code_verifier;

        let url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + process.env.redirectURL + '&code_verifier=' + code_verifier;

        request.post(url, (error, response, body) => {

            // Parse response to JSON
            body = JSON.parse(body);

            // Logs your access and refresh tokens in the browser
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);

            if (body.access_token) {

                // Step 4:
                // We can now use the access token to authenticate API calls

                // Send a request to get your user information using the /me context
                // The `/me` context restricts an API call to the user the token belongs to
                // This helps make calls to user-specific endpoints instead of storing the userID

                request.get('https://api.zoom.us/v2/users/me', (error, response, body) => {
                    if (error) {
                        console.log('API Response Error: ', error)
                    } else {
                        body = JSON.parse(body);
                        // Display response in console
                        console.log('API call ', body);
                        // Display response in browser
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
                        res.send(`
                            <style>
                                @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "👋";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                            </style>
                            <div class="container">
                                <div class="info">
                                    <img src="${body.pic_url}" alt="User photo" />
                                    <div>
                                        <span>Hello World!</span>
                                        <h2>${body.first_name} ${body.last_name}</h2>
                                        <p>${body.role_name}, ${body.company}</p>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>JSON Response:</h4>
                                    <a href="https://marketplace.zoom.us/docs/api-reference/zoom-api/users/user" target="_blank">
                                        API Reference
                                    </a>
                                    ${JSONResponse}
                                </div>
                            </div>
                        `);
                    }
                }).auth(null, null, true, body.access_token);

            } else {
                // Handle errors, something's gone wrong!
            }

        }).auth(process.env.clientID, process.env.clientSecret);

        return;

    } else {
        // Generate the code_verifier and code_challenge
        const { code_verifier, code_challenge } = generatePKCE();

        // Store the code_verifier and a random state in the session
        req.session.code_verifier = code_verifier;
        req.session.state = crypto.randomBytes(16).toString('hex');

        // Step 2: 
        // If no authorization code is available, redirect to Zoom OAuth to authorize
        res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + process.env.clientID + '&redirect_uri=' + process.env.redirectURL + '&code_challenge=' + code_challenge + '&code_challenge_method=S256' + '&state=' + req.session.state)
    }
})

app.listen(4000, () => console.log(`Zoom Hello World app listening at PORT: 4000`))