const {npath} = require(`@yarnpkg/fslib`);
const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {synchroniseWithMaster} = require(`../git/synchroniseWithMaster`);

class Resync extends Command {
  async execute() {
    const git = await openRepository(npath.toPortablePath(this.cwd), {
      stdout: this.context.stdout,
    });

    this.context.stdout.write(`Syncing against master...\n`);
    await synchroniseWithMaster(git);

    this.context.stdout.write(`Done - pushing the changes!\n`);
    await this.context.driver.pushToOrigin(git, `--force-with-lease`, `merge-queue`);
  }
}

Resync.schema = yup.object().shape({
  cwd: yup.string().required(),
});

Resync.addPath(`resync`);

Resync.addOption(`cwd`, Command.String(`--cwd`));

module.exports = Resync;
