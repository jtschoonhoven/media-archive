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

## Setup

This app runs on AWS ElasticBeanstalk (EBS). Before you begin you will need an active EBS cluster with an attached AWS Postgres RDS. See `./config/custom-environment-variables.js` for a list of environment variables that must be defined.

First make sure you have credentials for an AWS account with an active EBS cluster. See the [AWS docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-quick-configuration) for help with configuring credentials. Or just `brew install awscli` and run `aws configure`.

Now you should be able to deploy the app by following the instructions in the **Deploys** section.

## Deploys

App is configured to be deployed to Elastic Beanstalk on AWS. First ensure the EB client has been installed and configured with `brew install awsebcli` and `eb use your-environment-name`.

The first time you deploy you will need to initialize a new EBS project with `eb init`. You *MUST* additionally append some additional configuration to the generated `config.yml` file:

```bash
echo '' >> .elasticbeanstalk/config.yml
echo 'deploy:' >> .elasticbeanstalk/config.yml
echo '  artifact: dist/archive.zip' >> .elasticbeanstalk/config.yml
```

Now you can deploy with the npm script:

```bash
npm run deploy
```