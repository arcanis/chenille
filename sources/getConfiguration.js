const yaml = require(`js-yaml`);

exports.BASE_CONFIGURATION = {
  branches: {
    master: process.env.INPUT_MASTER || `master`,
    mergeQueue: process.env.INPUT_MERGEQUEUE || `merge-queue`,
  },
};

exports.getConfiguration = async git => {
  let configFile;
  try {
    configFile = await git(`show`, `${exports.BASE_CONFIGURATION.branches.master}:chenille.yml`);
  } catch {}

  return {
    ...configFile ? yaml.load(configFile) : {},
    ...exports.BASE_CONFIGURATION,
  };
};
