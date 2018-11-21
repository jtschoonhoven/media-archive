const path = require('path');
const precss = require('precss');
const autoprefixer = require('autoprefixer');


module.exports = {
    mode: 'development',
    entry: path.join(__dirname, 'src/app.js'),
    output: {
        path: path.join(__dirname, 'www'),
        filename: 'bundle.js',
    },
    externals: [{ window: 'window' }],
    devtool: 'source-map',
    module: {
        rules: [
            // TODO: transpile to ES5 for legacy browsers
            // {
            //     loader: 'babel-loader',
            //     test: /\.jsx?$/,
            //     exclude: path.join(__dirname, '/node_modules'),
            //     options: { presets: ['env'] },
            // },
            // ESLINT
            {
                loader: 'eslint-loader',
                enforce: 'pre',
                test: /\.jsx?$/,
                exclude: path.join(__dirname, '/node_modules'),
            },
            // SCSS
            {
                test: /\.(scss)$/,
                use: [{
                    // inject CSS to page
                    loader: 'style-loader',
                },
                {
                    // translate CSS into CommonJS modules
                    loader: 'css-loader',
                },
                {
                    // Run post css actions
                    loader: 'postcss-loader',
                    options: {
                        // post css plugins, can be exported to postcss.config.js
                        plugins() {
                            return [precss, autoprefixer];
                        },
                    },
                },
                {
                    // compile Sass to CSS
                    loader: 'sass-loader',
                }],
            },
        ],
    },
};
