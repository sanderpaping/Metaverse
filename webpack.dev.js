const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());
module.exports = merge(common, {
    mode: "development",
    devtool: "cheap-source-map",
    devServer: {
        host: "0.0.0.0",
        allowedHosts: "all",
        port: 8080, //port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        hot: true,
        devMiddleware: {
            publicPath: "/",
        }
    },
});