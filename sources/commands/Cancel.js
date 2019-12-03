const {npath} = require(`@yarnpkg/fslib`);
const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);

class Cancel extends Command {
  async execute() {
    const git = await openRepository(npath.toPortablePath(this.cwd), {
      stdout: this.context.stdout,
    });

    this.context.stdout.write(`Removing ${this.pr} from the merge queue (if needed)...\n`);
    await removeFromMergeQueue(git, this.pr);

    this.context.stdout.write(`Done - pushing the changes!\n`);
    await this.context.driver.pushToOrigin(git, `--force-with-lease`, `merge-queue`);
  }
}

Cancel.schema = yup.object().shape({
  cwd: yup.string().required(),
  pr: yup.number().required(),
});

Cancel.addPath(`cancel`);

Cancel.addOption(`cwd`, Command.String(`--cwd`));
Cancel.addOption(`pr`, Command.String());

module.exports = Cancel;
