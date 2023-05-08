# Zoom OAuth PKCE Hello World

Use of this sample app is subject to our [Terms of Use](https://zoom.us/docs/en-us/zoom_api_license_and_tou.html)

This is a Hello World app using an OAuth Marketplace App client ID and Secret to create an OAuth token, used to call the Zoom API. This app has been updated to include PKCE support.

Follow along with relevant Zoom OAuth documentation as we set this up:

1. [OAuth 2.0 for Zoom](https://developers.zoom.us/docs/integrations/oauth/)
2. [Create an OAuth App](https://developers.zoom.us/docs/integrations/create/)

## Setup app locally

Clone and install the app and its dependencies. We'll be using [Express](https://www.npmjs.com/package/express) for a basic Node.js server, [dotenv](https://www.npmjs.com/package/dotenv) for our credentials, [requests](https://www.npmjs.com/package/requests) to make HTTP requests, [crypto](https://www.npmjs.com/package/crypto) for generating PKCE codes, [express-session](https://www.npmjs.com/package/express-session) for handling sessions, and [nodemon](https://www.npmjs.com/package/nodemon) for easier development refreshing.

```bash
git clone https://github.com/marksowell/zoom-oauth-pkce-sample-app.git
```

```bash
cd zoom-oauth-pkce-sample-app && npm install 
```

Run server:

```bash
npm run start
```

### Setup dotenv

Create a `.env` file in which to store your PORT, access credentials, Redirect URL, and session secret.

```bash
touch .env
```

Copy the following into this file, which we'll add your own values to:

```bash
clientID=
clientSecret=
redirectURL=
SESSION_SECRET=
```

You can use the crypto package, which is already included in your project, to generate a secure random string for your session secret. Run the following command in your terminal to create a secret string.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Remember: Never share or store your client credentials publicly. Your `.env` is included in the `.gitignore` file to ensure these files won't be included in a git workflow.

## Install [ngrok](https://ngrok.com/)

During the OAuth flow, Zoom will need to know where to redirect a user after they have successfully authenticated and installed the app on their account.

For this we'll use [ngrok](https://ngrok.com/download), which creates a public link to a localhost development server.

Download and install ngrok, then follow the steps to connect your account.

Run ngrok on the same localhost port (4000):

```bash
~/./ngrok http 4000
```

This will generate a forwarding link. Copy this and add it into your `.env` file as the `redirectURL`. Keep ngrok running! If the linkage disconnects, we'll need to readd a new redirectURL.

Example:

```bash
redirectURL=https://12345678.ngrok.io
```

## Create an OAuth App on the Zoom App Marketplace

Sign in to the Zoom App Marketplace and [Create an OAuth App](https://developers.zoom.us/docs/integrations/create/).

Creating this app will generate your OAuth Client ID and Secret needed to install on your account and get an access token.

Copy these credentials and add them to your `.env` file.

Example:

```bash
clientID=1234567890
clientSecret=13245678901234567890
redirectURL=https://12345678.ngrok.io
SESSION_SECRET=your_session_secret_here
```

### Add your Redirect URL from ngrok to your app

Copy and paste your ngrok link into the Redirect URL for OAuth field, then click Continue.

### Fill out app information

To install the app, we'll need to add some quick info on the app. Add in the following:

1. *Short Description*
2. *Long Description*
3. *Developer Name*
4. *Developer Contact*

> We won't need to add any Features to our app, but if we wanted to enable [Event Subscriptions](https://developers.zoom.us/docs/api/rest/webhook-reference) through Zoom Webhooks, we'd do it here.

### Add Scopes

OAuth is used to guarantee that an app only has access to the data you authorize. If an app does not have the required scope, it cannot call the API on your behalf.

To request data,we'll need to add a Scope to our app. The only data we need is for a user's profile information. Click **+ Add Scopes** and add *"View your user information"* (`user:read`). Click **Done** and continue on to the Installation page.

## Install app

With our app running on `localhost:4000`, a live redirectURL from ngrok, and proper scopes requested we can now install the app on our account.

Click **Install** or copy the Installation URL into a browser.

Zoom will now ask you to authorize the app on your account. Note that the app is requesting only the scope we've added.

> If you're not the admin on your Zoom account, the admin might require you to ask them for pre-approval to install this app. Submit a request to get this pre-approved by your account admin.

Authorizing the app will send you to the Redirect URL of your app, linked to our app running on localhost:4000.

Your express server will log your access_token, refresh_token and the API call response to get your user information.

In your browser, you'll see your Zoom profile data, with a JSON object showing the response. This API request was made using an `access_token` specific to this app and scopes.

## Next steps

Follow our documentation on OAuth with Zoom for more information on building a user-level app on the Zoom App Marketplace.

Code happy!

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://zoom.us/docs/en-us/developer-support-plans.html) plans.
