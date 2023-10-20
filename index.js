const path = require('path');
const execa = require('execa');
const readPkgUp = require('read-pkg-up');
const writePkg = require('write-pkg');
const pathExists = require('path-exists');
const { writeFileSync } = require('fs');
const template = `import fs from "fs";
import posthtml from "posthtml"

const html = fs.readFileSync('index.html', 'utf-8')
const plugins = []
const options = {}

posthtml(plugins)
  .process(html, options)
  .then((result) =>  console.log(result.html))`;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>create-posthtml-ts</title>
</head>
<body>

</body>
</html>`;

const startScript = (build) => {
  if (build) {
    return build;
  }

  return 'ts-node index.ts';
};

module.exports = async (options = {}) => {
  const packageResult =
    readPkgUp.sync({
      cwd: options.cwd,
      normalize: false,
    }) || {};
  const packageJson = packageResult.package || {};
  const packagePath =
    packageResult.path || path.resolve(options.cwd || '', 'package.json');
  const packageCwd = path.dirname(packagePath);

  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.start = startScript(packageJson.scripts.start);

  if (!pathExists.sync(path.join(packageCwd, 'index.ts'))) {
    writeFileSync(path.resolve(options.cwd || '', 'index.ts'), template);
  }

  if (!pathExists.sync(path.join(packageCwd, 'index.html'))) {
    writeFileSync(path.resolve(options.cwd || '', 'index.html'), html);
  }

  writePkg.sync(packagePath, packageJson);

  await execa('npm', ['install', '--save-dev', 'ts-node', 'posthtml'], {
    cwd: packageCwd,
  });
};
