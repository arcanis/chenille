const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);
const {isSynchronisedWithMaster} = require(`./isSynchronisedWithMaster`);

exports.synchroniseWithMaster = async git => {
  const canceled = [];
  if (await isSynchronisedWithMaster(git))
    return canceled;

  const prs = await getAllQueuedPullRequests(git);

  await git(`checkout`, `-b`, `temp/${git.config.branches.mergeQueue}`, git.config.branches.mergeQueue);
  await git(`reset`, `--hard`, git.config.branches.master);

  for (const pr of prs) {
    try {
      await git(`cherry-pick`, pr.hash);
    } catch {
      await git(`cherry-pick`, `--abort`);
      canceled.push(pr);
    }
  }
  
  await git(`checkout`, git.config.branches.mergeQueue);
  await git(`reset`, `--hard`, `temp/${git.config.branches.mergeQueue}`);
  await git(`branch`, `-D`, `temp/${git.config.branches.mergeQueue}`);

  return canceled;
};
