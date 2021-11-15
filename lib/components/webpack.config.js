const path = require('path');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./components/components.ts",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "components.js",
    library: { 
      name: "components",
      type: "umd",
    },
    globalObject: 'this',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      { 
        test: /\.tsx?$/, 
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig-lib.json"
            }
          }
        ]
      },
    ]
  }
};
