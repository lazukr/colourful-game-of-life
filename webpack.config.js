const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    mode: "development",
    devtool: 'inline-source-map',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        host: '0.0.0.0',
        port: 8085,
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './src/index.html'),
                    to: path.resolve(__dirname, 'dist'),
                },
            ]
        })
    ]
}