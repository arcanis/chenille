exports.sendToMergeQueue = async (git, pr, hash) => {
  try {
    const authorName = await git(`log`, `-1`, `--pretty=format:'%an'`, hash);
    const authorEmail = await git(`log`, `-1`, `--pretty=format:'%ae'`, hash);

    const author = [
      `-c`, `user.name=${authorName}`,
      `-c`, `user.email=${authorEmail}`,
    ];

    await git(`checkout`, git.config.branches.mergeQueue);
    await git(`merge`, `--squash`, hash);
    await git.prefixSquashMessage(`[#${pr.number}] ${pr.title}\n\nCloses: #${pr.number}\n\n`);
    await git(...author, `commit`, `--no-edit`, `--author`, `${authorName} <${authorEmail}>`);

    return [];
  } catch (error) {
    return [{
      ...pr,
      reason: `Merge into ${git.config.branches.master} failed (${error.message})`,
    }];
  }
};
