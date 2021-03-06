/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {clearBranches} = require(`../git/clearBranches`);
const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);
const {retryIfStale} = require(`../git/retryIfStale`);
const {sendToMergeQueue} = require(`../git/sendToMergeQueue`);

class Queue extends Command {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    const remote = `pull/${this.pr}/head`;
    const local = `pr-${this.pr}`;

    const cancelled = await retryIfStale(async () => {
      await clearBranches(git, git.config.branches.mergeQueue, local);

      this.context.stdout.write(`Fetching the head for ${remote}...\n`);
      await this.context.driver.fetchFromOrigin(git, `${git.config.branches.mergeQueue}:${git.config.branches.mergeQueue}`, `${remote}:${local}`);

      this.context.stdout.write(`Removing ${this.pr} from the merge queue (if needed)...\n`);
      await removeFromMergeQueue(git, this.pr);

      this.context.stdout.write(`Squashing ${this.pr} into the merge queue (${await git(`rev-parse`, `--short`, local)})...\n`);
      const cancelled = await sendToMergeQueue(git, {number: this.pr, title: this.title}, local);

      if (cancelled.length > 0)
        return cancelled;

      this.context.stdout.write(`Done - pushing the changes!\n`);
      await this.context.driver.pushToOrigin(git, `--atomic`, `--force-with-lease`, git.config.branches.mergeQueue);

      return cancelled;
    });

    await this.context.driver.sendCancelNotifications(git, cancelled);
  }
}

Queue.schema = yup.object().shape({
  title: yup.string().required(),
  pr: yup.number().required(),
});

Queue.addPath(`queue`);

Queue.addOption(`title`, Command.String(`--title`));
Queue.addOption(`pr`, Command.String());

module.exports = Queue;
