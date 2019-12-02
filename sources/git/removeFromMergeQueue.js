const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);

exports.removeFromMergeQueue = async (git, removedPr) => {
  const canceled = [];
  const prs = await getAllQueuedPullRequests(git);

  const killPoint = prs.findIndex(({number}) => number === removedPr);
  if (killPoint === -1)
    return {canceled};

  const {hash} = prs[killPoint];

  await git(`checkout`, `-b`, `temp/merge-queue`);
  await git(`reset`, `--hard`, `${hash}^1`);

  for (const pr of prs.slice(killPoint + 1)) {
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
