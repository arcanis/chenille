const {npath} = require(`@yarnpkg/fslib`);
const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {synchroniseWithMaster} = require(`../git/synchroniseWithMaster`);

class SyncAgainstMaster extends Command {
  async execute() {
    const git = await openRepository(this.context.cwd, {
      stdout: this.context.stdout,
    });

    this.context.stdout.write(`Syncing against master...\n`);
    await synchroniseWithMaster(git);

    this.context.stdout.write(`Done - pushing the changes!\n`);
    await this.context.driver.pushToOrigin(git, `--force-with-lease`, `merge-queue`);
  }
}

SyncAgainstMaster.addPath(`sync`, `against`, `master`);

module.exports = SyncAgainstMaster;
