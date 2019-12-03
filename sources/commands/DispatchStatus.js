const {npath} = require(`@yarnpkg/fslib`);
const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);
const {setBranchToCommit} = require(`../git/setBranchToCommit`)

const {normalizeStatusMap} = require(`../normalizeStatusMap`);
const {validateStatusMap} = require(`../validateStatusMap`);

class DispatchStatus extends Command {
  async execute() {
    const git = openRepository(npath.toPortablePath(this.cwd));
    const fetchCommitStatus = require(this.driver).fetchCommitStatus;

    const prs = await getAllQueuedPullRequests(git);
    const prsWithStatus = await fetchCommitStatus(git, prs);

    for (const pr of prsWithStatus) {
      pr.statusMap = await normalizeStatusMap(git, pr.statusMap);
      pr.status = validateStatusMap(pr.statusMap);
    }

    let okCount = 0;
    while (okCount < prsWithStatus.length && prsWithStatus[okCount].status === true)
      okCount += 1;

    if (okCount > 0) {
      this.context.stdout.write(`Synchronizing master to ${prsWithStatus[okCount - 1].number}`);
      await setBranchToCommit(git, `master`, prsWithStatus[okCount - 1].hash);
    }

    if (okCount < prsWithStatus.length && prsWithStatus[okCount].status === -1) {
      this.context.stdout.write(`Removing ${prsWithStatus[okCount].number}`);
      await removeFromMergeQueue(git, prsWithStatus[okCount].number);
    }

    this.context.stdout.write(`Done - pushing the changes!\n`);
    await git(`push`, `origin`, `--force-with-lease`, `merge-queue`, `master`);
  }
}

DispatchStatus.schema = yup.object().shape({
  cwd: yup.string().required(),
  driver: yup.string().required(),
});

DispatchStatus.addPath(`dispatch`, `status`);

DispatchStatus.addOption(`cwd`, Command.String(`--cwd`));
DispatchStatus.addOption(`driver`, Command.String(`--driver`));

module.exports = DispatchStatus;
