const {getAllQueuedPullRequests} = require(`./getAllQueuedPullRequests`);

exports.removeFromMergeQueue = async (git, removedPr, {reason = `n/a`} = {}) => {
  const cancelled = [];
  const prs = await getAllQueuedPullRequests(git);

  const killPoint = prs.findIndex(({number}) => number === removedPr);
  if (killPoint === -1)
    return {cancelled};

  cancelled.push({
    ...prs[killPoint],
    reason,
  });

  const {hash} = prs[killPoint];

  await git(`checkout`, `-b`, `temp/merge-queue`, `merge-queue`);
  await git(`reset`, `--hard`, `${hash}^1`);

  for (const pr of prs.slice(killPoint + 1)) {
    try {
      await git(`cherry-pick`, pr.hash);
    } catch {
      await git(`cherry-pick`, `--abort`);
      cancelled.push({
        ...pr,
        reason: `Rebase on top of master failed`,
      });
    }
  }

  await git(`checkout`, `merge-queue`);
  await git(`reset`, `--hard`, `temp/merge-queue`);
  await git(`branch`, `-D`, `temp/merge-queue`);

  return {cancelled};
};
