const {Command} = require(`clipanion`);

const {getAllQueuedPullRequests} = require(`../git/getAllQueuedPullRequests`);
const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);
const {setBranchToCommit} = require(`../git/setBranchToCommit`)

const {normalizeStatusMap} = require(`../normalizeStatusMap`);
const {validateStatusMap} = require(`../validateStatusMap`);

class SyncAgainstQueue extends Command {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    const prs = await getAllQueuedPullRequests(git);
    if (prs.length === 0) {
      this.context.stdout.write(`No PRs queued; bailout\n`);
      return;
    }

    const prsWithStatus = await this.context.driver.fetchCommitStatus(git, prs);

    for (const pr of prsWithStatus) {
      pr.statusMap = await normalizeStatusMap(git, pr.statusMap);
      pr.status = validateStatusMap(pr.statusMap);

      this.context.stdout.write(`#${pr.number} - ${pr.title} - ${pr.status}\n`);
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
    await this.context.driver.pushToOrigin(git, `--force-with-lease`, `master`, `merge-queue`);
  }
}

SyncAgainstQueue.addPath(`sync`, `against`, `queue`);

module.exports = SyncAgainstQueue;
