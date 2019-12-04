const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);

class Cancel extends Command {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    this.context.stdout.write(`Removing ${this.pr} from the merge queue (if needed)...\n`);
    await removeFromMergeQueue(git, this.pr);

    this.context.stdout.write(`Done - pushing the changes!\n`);
    await this.context.driver.pushToOrigin(git, `--force-with-lease`, `merge-queue`);
  }
}

Cancel.schema = yup.object().shape({
  pr: yup.number().required(),
});

Cancel.addPath(`cancel`);

Cancel.addOption(`pr`, Command.String());

module.exports = Cancel;
