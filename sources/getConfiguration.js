const {npath, ppath, xfs} = require(`@yarnpkg/fslib`);
const yaml = require(`js-yaml`);

exports.getConfiguration = async git => {
  const nRoot = await git(`rev-parse`, `--show-toplevel`);
  const pRoot = npath.toPortablePath(nRoot);

  const configPath = ppath.resolve(pRoot, `chenille.yml`);
  if (!xfs.existsSync(configPath))
    return {};

  const configFile = await xfs.readFilePromise(configPath, `utf8`);
  const configData = yaml.load(configFile);

  return configData;
};
