# Media Archive

Web app for storing and indexing digitized documents, photos, audio, and video.

## App Structure

The `client` directory stores the un-bundled **source** files for the public web app. These are bundled and transpiled with **webpack** and saved to the `dist` sibling directory.

The `server` directory stores the private **server** files for the backend Node app.

The `dist` directory stores the **bundled** source for the public web app as well as other files (HTML, images) that are public to the web.

## Developing

```sh
git clone git@github.com:jtschoonhoven/media-archive.git
cd media-archive
initdb -D .pgdata # create a development postgres database
npm install # install all dependencies
npm run db # start postgres server
npm run build # bundle all typescript assets
npm run start-dev # start web server
npm run watch # OPTIONAL: rebundle typescript assets on change
```

## Deploys

App is configured to be deployed to Elastic Beanstalk on AWS. First ensure the EB client has been installed with `brew install awsebcli`.

```
npm run deploy
```
