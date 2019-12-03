const yaml = require(`js-yaml`);

exports.getConfiguration = async git => {
  let configFile;
  try {
    configFile = await git(`show`, `master:chenille.yml`);
  } catch {
    return {};
  }

  return yaml.load(configFile);
};
