exports.sendToMergeQueue = async (git, {number, title}, hash) => {
  await git(`checkout`, `merge-queue`);
  await git(`merge`, `--squash`, hash);
  await git.prefixSquashMessage(`[#${number}] ${title}\n\n`);
  await git(`commit`, `--no-edit`);
};
