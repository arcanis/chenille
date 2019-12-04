const {npath} = require(`@yarnpkg/fslib`);
const {Cli} = require(`clipanion`);

const cli = new Cli({binaryName: `yarn chenille`});

cli.register(require(`./commands/DispatchComment`));

cli.register(require(`./commands/SyncAgainstMaster`));
cli.register(require(`./commands/SyncAgainstQueue`));

cli.register(require(`./commands/Cancel`));
cli.register(require(`./commands/Queue`));

module.exports = cli;

if (process.mainModule === module) {
  cli.runExit(process.argv.slice(2), {
    cwd: npath.toPortablePath(process.cwd()),
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  });
}
