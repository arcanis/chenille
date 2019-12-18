const {Command} = require(`clipanion`);

const {getAllQueuedPullRequests} = require(`../git/getAllQueuedPullRequests`);
const {isSynchronisedWithMaster} = require(`../git/isSynchronisedWithMaster`);
const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);
const {retryIfStale} = require(`../git/retryIfStale`);
const {setBranchToCommit} = require(`../git/setBranchToCommit`)

const {normalizeStatusMap} = require(`../normalizeStatusMap`);
const {validateStatusMap} = require(`../validateStatusMap`);

class SyncAgainstQueue extends Command {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    const cancelled = await retryIfStale(async () => {
      let cancelled = [];

      this.context.stdout.write(`Fetching the head for master and the merge queue...\n`);
      await this.context.driver.fetchFromOrigin(git, git.config.branches.master, git.config.branches.mergeQueue);

      // There is a chance that this workflow is executed right after
      // something has been pushed on master but before the
      // SyncAgainstMaster job has been triggered. Without this check
      // we would risk overriding master with the merge queue head,
      // forgetting any ninja-landed commit.

      if (!await isSynchronisedWithMaster(git)) {
        this.context.stdout.write(`Branch ${git.config.branches.master} is ahead of the merge queue; bailout\n`);
        return cancelled;
      }

      const prs = await getAllQueuedPullRequests(git);
      if (prs.length === 0) {
        this.context.stdout.write(`No PRs queued; bailout\n`);
        return cancelled;
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

      // If the merge queue contains green commits, then we can move
      // them into master. Since we have previously checked that
      // master and merge-queue are in sync, we don't risk overriding
      // master by accident (because we'll push w/ force-with-lease).

      if (okCount > 0) {
        this.context.stdout.write(`Synchronizing ${git.config.branches.master} to ${prsWithStatus[okCount - 1].number}`);
        await setBranchToCommit(git, git.config.branches.master, prsWithStatus[okCount - 1].hash);
      }

      // If a commit adjacent to a green commit is red, is probably
      // means something is wrong with it. We must remove it from
      // the queue in the hope that the following commits will be
      // green (all the tests will unfortunately have to run anew).

      if (okCount < prsWithStatus.length && prsWithStatus[okCount].status === false) {
        this.context.stdout.write(`Removing ${prsWithStatus[okCount].number}\n`);
        cancelled = await removeFromMergeQueue(git, prsWithStatus[okCount].number, {reason: `Tests results are red`});
      }

      if (okCount > 0 || cancelled.length > 0) {
        this.context.stdout.write(`Done - pushing the changes!\n`);
        await this.context.driver.pushToOrigin(git, `--atomic`, `--force-with-lease`, git.config.branches.master, git.config.branches.mergeQueue);
      }

      return cancelled;
    });

    await this.context.driver.sendCancelNotifications(cancelled);
  }
}

SyncAgainstQueue.addPath(`sync`, `against`, `queue`);

module.exports = SyncAgainstQueue;
