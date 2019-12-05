exports.isSynchronisedWithMaster = async git => {
  return Number(await git(`rev-list`, `--count`, `merge-queue..master`)) === 0;
};
