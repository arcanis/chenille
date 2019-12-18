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
      this.context.stdout.write(`Fetching the head for ${git.config.branches.master} and the merge queue...\n`);
      await this.context.driver.fetchFromOrigin(git, git.config.branches.master, git.config.branches.mergeQueue);

      // If we have any commit that are on master but not yet inside
      // the merge queue, then we need to rebase the whole merge
      // queue on top of the new master (otherwise there's a chance
      // that the new master commits would cause the commits in the
      // merge queue to fail)

      this.context.stdout.write(`Syncing against ${git.config.branches.master}...\n`);
      const cancelled = await synchroniseWithMaster(git);

      // We must always push the result, because it's possible for
      // our merge queue to not contain any PR that isn't in master
      // but that doesn't mean we don't want the merge queue to
      // follow master.
      //
      // if (cancelled.length === 0)
      //   return cancelled;

      this.context.stdout.write(`Done - pushing the changes!\n`);
      await this.context.driver.pushToOrigin(git, `--atomic`, `--force-with-lease`, git.config.branches.master, git.config.branches.mergeQueue);

      return cancelled;
    });

    await this.context.driver.sendCancelNotifications(cancelled);
  }
}

SyncAgainstMaster.addPath(`sync`, `against`, `master`);

module.exports = SyncAgainstMaster;
