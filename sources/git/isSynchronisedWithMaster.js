exports.isSynchronisedWithMaster = async git => {
  return Number(await git(`rev-list`, `--count`, `${git.config.branches.mergeQueue}..${git.config.branches.master}`)) === 0;
};
