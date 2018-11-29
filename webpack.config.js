const autoprefixer = require('autoprefixer');
const path = require('path');
const precss = require('precss');


module.exports = {
    mode: 'development',
    entry: path.join(__dirname, 'client/main.jsx'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
    },
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
            // scss
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
                    options: { plugins: [precss, autoprefixer] },
                },
                {
                    // compile Sass to CSS
                    loader: 'sass-loader',
                }],
            },
        ],
    },
};
