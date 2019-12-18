const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);
const {retryIfStale} = require(`../git/retryIfStale`);

class Cancel extends Command {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    const cancelled = await retryIfStale(async () => {
      this.context.stdout.write(`Fetching the head for ${git.config.branches.mergeQueue}...\n`);
      await this.context.driver.fetchFromOrigin(git, git.config.branches.mergeQueue);

      this.context.stdout.write(`Removing ${this.pr} from the merge queue (if needed)...\n`);
      const cancelled = await removeFromMergeQueue(git, this.pr, {reason: `Manual request`});

      if (cancelled.length === 0)
        return cancelled;

      this.context.stdout.write(`Done - pushing the changes!\n`);
      await this.context.driver.pushToOrigin(git, `--atomic`, `--force-with-lease`, git.config.branches.mergeQueue);

      return cancelled;
    });

    await this.context.driver.sendCancelNotifications(cancelled);
  }
}

Cancel.schema = yup.object().shape({
  pr: yup.number().required(),
});

Cancel.addPath(`cancel`);

Cancel.addOption(`pr`, Command.String());

module.exports = Cancel;
