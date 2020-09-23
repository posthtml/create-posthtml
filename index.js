const path = require('path');
const execa = require('execa');
const readPkgUp = require('read-pkg-up');
const writePkg = require('write-pkg');
const pathExists = require('path-exists');
const {writeFileSync} = require('fs')
const template = `const fs = require('fs')
const posthtml = require('posthtml')

const html = fs.readFileSync('index.html', 'utf-8')
const plugins = []
const options = {}

posthtml(plugins)
  .process(html, options)
  .then((result) =>  console.log(result.html))`
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>create-posthtml</title>
</head>
<body>
  
</body>
</html>`;

const buildScript = build => {
  if (build) {
    return build;
  }

  return 'node index.js';
};

module.exports = async (options = {}) => {
  const packageResult = readPkgUp.sync({
    cwd: options.cwd,
    normalize: false
  }) || {};
  const packageJson = packageResult.package || {};
  const packagePath = packageResult.path || path.resolve(options.cwd || '', 'package.json');
  const packageCwd = path.dirname(packagePath);

  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.build = buildScript(packageJson.scripts.build);

  if (!pathExists.sync(path.join(packageCwd, 'index.js'))) {
    writeFileSync(path.resolve(options.cwd || '', 'index.js'), template)
  }

  if (!pathExists.sync(path.join(packageCwd, 'index.html'))) {
    writeFileSync(path.resolve(options.cwd || '', 'index.html'), html)
  }

  writePkg.sync(packagePath, packageJson);
  
  await execa('npm', ['install', '--save-dev', 'posthtml'], {cwd: packageCwd});
}