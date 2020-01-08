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
      const authorName = await git(`log`, `-1`, `--pretty=format:'%an'`, pr.hash);
      const authorEmail = await git(`log`, `-1`, `--pretty=format:'%ae'`, pr.hash);

      const author = [
        `-c`, `user.name=${authorName}`,
        `-c`, `user.email=${authorEmail}`,
      ];

      await git(...author, `cherry-pick`, pr.hash);
    } catch (error) {
      await git(`cherry-pick`, `--abort`);
      canceled.push({
        ...pr,
        reason: `Rebase on top of ${git.config.branches.master} failed (${error.message})`,
      });
    }
  }

  await git(`checkout`, git.config.branches.mergeQueue);
  await git(`reset`, `--hard`, `temp/${git.config.branches.mergeQueue}`);
  await git(`branch`, `-D`, `temp/${git.config.branches.mergeQueue}`);

  return canceled;
};
