const {npath} = require(`@yarnpkg/fslib`);
const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);
const {setBranchToCommit} = require(`../git/setBranchToCommit`)

class DispatchStatus extends Command {
  async execute() {
    const git = openRepository(npath.toPortablePath(this.cwd));
    const fetchCommitStatus = require(this.driver).fetchCommitStatus;

    const commits = await getAllQueuedPullRequests(git);
    const status = await fetchCommitStatus(commits);

    let okCount = 0;
    while (okCount < status.length && status[okCount].status === 1)
      okCount += 1;

    if (okCount > 0)
      await setBranchToCommit(git, `master`, status[okCount - 1].hash);

    if (okCount < status.length && status[okCount].status === -1)
      await removeFromMergeQueue(git, status[okCount].number);

    this.context.stdout.write(`Done - pushing the changes!\n`);
    await git(`push`, `origin`, `--force-with-lease`, `merge-queue`, `master`);
  }
}

DispatchStatus.schema = yup.object().shape({
  cwd: yup.string().required(),
  driver: yup.string().required(),
});

DispatchStatus.addPath(`cancel`);

DispatchStatus.addOption(`cwd`, Command.String(`--cwd`));
DispatchStatus.addOption(`driver`, Command.String(`--driver`));

module.exports = DispatchStatus;
