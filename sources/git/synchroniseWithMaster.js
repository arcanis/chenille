const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);

exports.synchroniseWithMaster = async git => {
  const canceled = [];

  const count = await git(`rev-list`, `--count`, `merge-queue..master`);
  if (count === 0)
    return {canceled};

  const prs = await getAllQueuedPullRequests(git);

  await git(`checkout`, `-b`, `temp/merge-queue`);
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

  return {canceled};
};
