const path = require('path');
const precss = require('precss');
const autoprefixer = require('autoprefixer');


module.exports = {
    mode: 'development',
    entry: path.join(__dirname, 'src/app.jsx'),
    output: {
        path: path.join(__dirname, 'www'),
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
