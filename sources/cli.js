const {Cli} = require(`clipanion`);

const cli = new Cli({binaryName: `yarn chenille`});

cli.register(require(`./commands/DebugContext`));

cli.register(require(`./commands/DispatchComment`));
cli.register(require(`./commands/DispatchStatus`));

cli.register(require(`./commands/Cancel`));
cli.register(require(`./commands/Queue`));
cli.register(require(`./commands/Resync`));

module.exports = cli;

if (process.mainModule === module) {
    cli.runExit(process.argv.slice(2), {
        stdin: process.stdin,
        stdout: process.stdout,
        stderr: process.stderr,
    });
}
