exports.getAllQueuedPullRequests = async (git, filter = `[[:digit:]]\\+` ) => {
  const prs = [];

  const output = await git(`log`, `--reverse`, `--grep=^\\[#${filter}\\]`, `${git.config.branches.master}..${git.config.branches.mergeQueue}`, `--pretty=format:%s%n%H`);
  if (output.length === 0)
    return prs;

  const lines = output.split(/\n/);
  for (let t = 0; t < lines.length; t += 2) {
    const oneline = lines[t];
    const hash = lines[t + 1];

    // The first number in the title is the PR number
    const [, numberStr, title] = oneline.match(/^\[#(\d+)\] (.*)/);
    const number = parseInt(numberStr, 10);

    prs.push({number, title, hash});
  }

  for (const pr of prs)
    console.log(JSON.stringify(pr));

  return prs;
};
