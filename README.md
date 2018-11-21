# Media Archive

Web app for storing and indexing digitized documents, photos, audio, and video. Work in progress.

## App Structure

The `src` directory stores the un-bundled **source** files for the public web app. These are bundled and transpiled with **webpack** and saved to the `www` sibling directory.

The `srv` directory stores the private **server** files for the backend Node app.

The `www` directory stores the **bundled** source for the public web app as well as other files (HTML, images) that are public to the web.
