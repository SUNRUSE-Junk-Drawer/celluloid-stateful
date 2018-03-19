import {
  join as pathJoin
} from "path"

import { NormalModuleReplacementPlugin } from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import WebappWebpackPlugin from "webapp-webpack-plugin"
import { WebpackBundleSizeAnalyzerPlugin } from "webpack-bundle-size-analyzer"

module.exports = {
  entry: "./src/engine/index.js",
  output: {
    path: pathJoin(__dirname, "dist"),
    filename: "index.js"
  },
  module: {
    rules: [{
      test: /\.js$/, use: {
        loader: "babel-loader",
        options: {
          presets: ["env"]
        }
      }
    }]
  },
  plugins: [
    new NormalModuleReplacementPlugin(/^fs$/, require.resolve("./src/webpack_shims/fs.js")),
    new NormalModuleReplacementPlugin(/^chokidar$/, require.resolve("./src/webpack_shims/chokidar.js")),
    new HtmlWebpackPlugin({
      inject: "head",
      title: "Celluloid",
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    new WebappWebpackPlugin({
      logo: "./src/favicon.png",
      prefix: "icons/",
      background: "#000",
      title: "Celluloid",
      icons: {
        coast: true,
        opengraph: true,
        twitter: true,
        yandex: true,
        windows: true
      }
    }),
    new WebpackBundleSizeAnalyzerPlugin(pathJoin(__dirname, "stats.txt"))
  ]
}