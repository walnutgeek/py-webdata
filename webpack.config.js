var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');

var name = 'webdata';


module.exports = {
    context: path.join(__dirname, 'app'),
    plugins: [
        new CopyWebpackPlugin([
            // Copy directory contents to {output}/
            { from: 'path/to/directory' },
        ])
    ]
};

function absdir(r){
  return path.resolve(__dirname, r) ;
}

function output_fn(name, dirname){
  dirname = dirname || 'dist';
  var dir = absdir( dirname) ;
  return { path: dir, filename: name, publicPath: "/" + dirname, library: name };
}

function cfg(entry_point, out_file, customizer){
  var c = {
    entry: entry_point,
    output: output_fn(out_file),
    devtool: "source-map",
    module: {
      preLoaders: [
        {
          test: /\.js$/,
          loaders: ['jshint'],
          include: ["js"].map(absdir)
        }
      ],
      loaders: [
          { test: /\.js$/,
              loader: "uglify" }
      ],
    },
    plugins: [
      new webpack.IgnorePlugin(/jsdom/)
    ]
  };
  if(customizer)customizer(c);
  return c;
}

module.exports = [
  cfg("./index.js",name + ".js"),
  cfg("mocha!./test/index.js","testBundle.js")
];