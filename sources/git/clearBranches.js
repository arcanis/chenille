exports.clearBranches = async (git, ...branches) => {
  await git(`checkout`, `--detach`);

  for (const branch of branches) {
    let branchExists = true;
    try {
      await git(`rev-parse`, `--verify`, branch);
    } catch {
      branchExists = false;
    }

    if (branchExists) {
      await git(`branch`, `-D`, branch);
    }
  }
};
