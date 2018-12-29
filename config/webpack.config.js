const autoprefixer = require('autoprefixer');
const ConfigWebpackPlugin = require('config-webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const precss = require('precss');


/*
 * Common webpack config used in all builds.
 */
const BASE_CONFIG = {
    plugins: [
        // expose a global _CONFIG object
        // see github.com/arthanzel/node-config-webpack
        new ConfigWebpackPlugin('_CONFIG'),
    ],
    module: {
        rules: [
            // eslint: lint JS before bundling
            {
                loader: 'eslint-loader',
                enforce: 'pre',
                test: /\.jsx?$/,
                exclude: path.join(__dirname, '../node_modules'),
                options: { plugins: ['react'] },
            },
            // babel: transpile JS and JSX for web
            {
                loader: 'babel-loader',
                test: /\.jsx?$/,
                exclude: path.join(__dirname, '../node_modules'),
                options: { presets: ['@babel/preset-env', '@babel/preset-react'] },
            },
        ],
    },
};

/*
 * Webpack config used for development builds.
 */
const DEVELOPMENT_CONFIG = {
    mode: 'development',
    devtool: 'source-map',
};

/*
 * Webpack config used for production builds.
 */
const PRODUCTION_CONFIG = {
    mode: 'production',
    devtool: 'nosources-source-map',
    plugins: [new OptimizeCSSAssetsPlugin()],
};

/*
 * Webpack config used for generating a client-specific build.
 */
const CLIENT_CONFIG = {
    target: 'web',
    entry: path.join(__dirname, '../client/client-router.jsx'),
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'bundle.client.js',
    },
    plugins: [
        // make CSS available to client
        new MiniCssExtractPlugin({
            path: path.join(__dirname, '../dist'),
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
                        options: { publicPath: '../dist/' },
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

/*
 * Webpack config used for generating a server-specific build.
 */
const SERVER_CONFIG = {
    target: 'node',
    entry: path.join(__dirname, '../client/server-router.jsx'),
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'bundle.server.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            // ignore CSS imports in server build
            {
                test: /\.(scss)$/,
                use: [{ loader: 'ignore-loader' }],
            },
        ],
    },
};


/*
 * Merge and export environment-specific configs.
 */
module.exports = (env, options) => {
    // bundle production by defauult
    if (options.mode !== 'development') {
        console.log('bundling production app');
        return [
            merge.smart(BASE_CONFIG, CLIENT_CONFIG, PRODUCTION_CONFIG),
            merge.smart(BASE_CONFIG, SERVER_CONFIG, PRODUCTION_CONFIG),
        ];
    }
    // bundle development only if specified
    console.log('bundling development app');
    return [
        merge.smart(BASE_CONFIG, CLIENT_CONFIG, DEVELOPMENT_CONFIG),
        merge.smart(BASE_CONFIG, SERVER_CONFIG, DEVELOPMENT_CONFIG),
    ];
};
