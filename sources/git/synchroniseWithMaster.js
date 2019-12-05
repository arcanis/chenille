const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);
const {isSynchronisedWithMaster} = require(`./isSynchronisedWithMaster`);

exports.synchroniseWithMaster = async git => {
  const canceled = [];
  if (await isSynchronisedWithMaster(git))
    return canceled;

  const prs = await getAllQueuedPullRequests(git);

  await git(`checkout`, `-b`, `temp/merge-queue`, `merge-queue`);
  await git(`reset`, `--hard`, `master`);

  for (const pr of prs) {
    try {
      await git(`cherry-pick`, pr.hash);
    } catch {
      await git(`cherry-pick`, `--abort`);
      canceled.push(pr);
    }
  }
  
  await git(`checkout`, `merge-queue`);
  await git(`reset`, `--hard`, `temp/merge-queue`);
  await git(`branch`, `-D`, `temp/merge-queue`);

  return canceled;
};
