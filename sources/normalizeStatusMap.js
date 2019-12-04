const {getConfiguration} = require(`./getConfiguration`);

exports.normalizeStatusMap = async (git, statusMap) => {
  const configuration = await getConfiguration(git);
  if (!configuration.requiredStatus)
    return statusMap;

  return new Map(configuration.requiredStatus.map(title => {
    return [title, statusMap.get(title)];
  }));
};
