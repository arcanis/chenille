exports.normalizeStatusMap = async (git, statusMap) => {
  if (!git.config.requiredStatus)
    return statusMap;

  return new Map(git.config.requiredStatus.map(title => {
    return [title, statusMap.get(title)];
  }));
};
