exports.sendToMergeQueue = async (git, pr, hash) => {
  try {
    const author = await git(`log`, `-1`, `--pretty=format:'%an <%ae>'`, hash);

    await git(`checkout`, `merge-queue`);
    await git(`merge`, `--squash`, hash);
    await git.prefixSquashMessage(`[#${pr.number}] ${pr.title}\n\nCloses: #${pr.number}\n\n`);
    await git(`commit`, `--no-edit`, `--author`, author);

    return [];
  } catch (error) {
    return [{
      ...pr,
      reason: `Merge into master failed`,
    }];
  }
};
