const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const precss = require('precss');


// common webpack config
const baseConfig = {
    mode: 'development',
    externals: [{ window: 'window' }],
    devtool: 'source-map',
    module: {
        rules: [
            // eslint
            {
                loader: 'eslint-loader',
                enforce: 'pre',
                test: /\.jsx?$/,
                exclude: path.join(__dirname, '/node_modules'),
                options: { plugins: ['react'] },
            },
            // babel
            {
                loader: 'babel-loader',
                test: /\.jsx?$/,
                exclude: path.join(__dirname, '/node_modules'),
                options: { presets: ['@babel/preset-env', '@babel/preset-react'] },
            },
        ],
    },
};

// webpack config for generating client-specific bundle
const baseClientConfig = {
    target: 'web',
    entry: path.join(__dirname, 'client/client.jsx'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.client.js',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'bundle.css',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: './dist/' },
                    },
                    {
                        // translate CSS into CommonJS modules
                        loader: 'css-loader',
                    },
                    {
                        // Run post css actions
                        loader: 'postcss-loader',
                        options: { plugins: [precss, autoprefixer] },
                    },
                    {
                        // compile Sass to CSS
                        loader: 'sass-loader',
                    },
                ],
            },
        ],
    },
};

// webpack config for generating node-specific bundle
const baseServerConfig = {
    target: 'node',
    entry: path.join(__dirname, 'client/server.jsx'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.server.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [{ loader: 'ignore-loader' }],
            },
        ],
    },
};

// merge client/server configs with base config
const clientConfig = Object.assign({}, baseConfig, baseClientConfig);
const serverConfig = Object.assign({}, baseConfig, baseServerConfig);

// concatenate base config rules with client rules
clientConfig.module.rules = baseConfig.module.rules.concat(
    baseClientConfig.module.rules,
);

// concatenate base config rules with server rules
serverConfig.module.rules = baseConfig.module.rules.concat(
    baseServerConfig.module.rules,
);


module.exports = [clientConfig, serverConfig];
