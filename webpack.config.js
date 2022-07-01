const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    // entry: path.resolve(appDirectory, "src/App.ts"), //path to the main .ts file
    entry: {
      app: './src/App.ts',
    },
    output: {
        filename: '[name].bundle.js', //name for the js file that is created/compiled in memory
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    // devServer: {
    //     host: "0.0.0.0",
    //     allowedHosts: "all",
    //     port: 8080, //port that we're using for local host (localhost:8080)
    //     static: path.resolve(__dirname, "public"), //tells webpack to serve from the public folder
    //     hot: true,
    //     devMiddleware: {
    //         publicPath: "/",
    //     }
    // },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, "public/index.html"),
        })
    ],
    mode: "development",
};