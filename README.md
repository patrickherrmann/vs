VS
----------------

This project allows you to poll Twitter for geotagged tweets mentioning certain topics. It then allows you to pair up topics and visualize which topic gets more mentions on a county level basis.

# Installation

This is a node app, so install npm first.

Inside the repo, run

```npm install```

to install server side dependencies.

If you don't have bower installed, install it with

```npm install -g bower```

Run

```bower install```

to install client side dependencies.

To poll Twitter, you need API credentials. Set the following environment variables for Twitter API access:
-    TWITTER_API_CONSUMER_KEY
-    TWITTER_API_CONSUMER_SECRET
-    TWITTER_API_ACCESS_TOKEN_KEY
-    TWITTER_API_ACCESS_TOKEN_SECRET

You'll also need Mongo DB running, so you'll need to set the MONGODB environment variable to the the name of your database.

Once dependencies are installed and your environment variables are set up, run the server with

```npm install```