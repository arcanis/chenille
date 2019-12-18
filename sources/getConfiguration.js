const yaml = require(`js-yaml`);

export const BASE_CONFIGURATION = {
  branches: {
    master: process.env.INPUT_MASTER || `master`,
    mergeQueue: process.env.INPUT_MERGEQUEUE || `merge-queue`,
  },
};

exports.getConfiguration = async git => {
  let configFile;
  try {
    configFile = await git(`show`, `${BASE_CONFIGURATION.branches.master}:chenille.yml`);
  } catch {
    return {};
  }

  return {
    ...yaml.load(configFile),
    ...BASE_CONFIGURATION,
  };
};
