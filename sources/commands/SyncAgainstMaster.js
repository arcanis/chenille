const {Command} = require(`clipanion`);

const {openRepository} = require(`../git/openRepository`);
const {retryIfStale} = require(`../git/retryIfStale`);
const {synchroniseWithMaster} = require(`../git/synchroniseWithMaster`);

class SyncAgainstMaster extends Command {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    const cancelled = await retryIfStale(async () => {
      this.context.stdout.write(`Fetching the head for master and the merge queue...\n`);
      await this.context.driver.fetchFromOrigin(git, `master`, `merge-queue`);

      // If we have any commit that are on master but not yet inside
      // the merge queue, then we need to rebase the whole merge
      // queue on top of the new master (otherwise there's a chance
      // that the new master commits would cause the commits in the
      // merge queue to fail)

      this.context.stdout.write(`Syncing against master...\n`);
      const cancelled = await synchroniseWithMaster(git);

      if (cancelled.length === 0)
        return cancelled;

      this.context.stdout.write(`Done - pushing the changes!\n`);
      await this.context.driver.pushToOrigin(git, `--atomic`, `--force-with-lease`, `master`, `merge-queue`);

      return cancelled;
    });

    await this.context.driver.sendCancelNotifications(cancelled);
  }
}

SyncAgainstMaster.addPath(`sync`, `against`, `master`);

module.exports = SyncAgainstMaster;
