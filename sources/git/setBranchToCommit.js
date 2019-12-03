exports.setBranchToCommit = async (git, branchName, hash) => {
  const currentBranch = await git(`rev-parse`, `--abbrev-ref`, `HEAD`);

  if (currentBranch === branchName) {
    await git(`reset`, `--hard`, hash);
  } else {
    await git(`branch`, `-f`, branchName, hash);
  }
};
