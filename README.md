# Media Archive

Web app for storing and indexing digitized documents, photos, audio, and video. Work in progress.

## App Structure

The `client` directory stores the un-bundled **source** files for the public web app. These are bundled and transpiled with **webpack** and saved to the `www` sibling directory.

The `server` directory stores the private **server** files for the backend Node app.

The `dist` directory stores the **bundled** source for the public web app as well as other files (HTML, images) that are public to the web.

## Developing

```sh
git clone git@github.com:jtschoonhoven/media-archive.git
cd media-archive
initdb -D .pgdata # create a development postgres database
npm run db # start postgres server
npm run start-dev # start web server
npm run watch # OPTIONAL: rebuild app on change
```
