const {Cli} = require(`clipanion`);

const cli = new Cli({binaryName: `yarn chenille`});

cli.register(require(`./commands/DebugContext`));
cli.register(require(`./commands/DispatchComment`));
cli.register(require(`./commands/DispatchPush`));
cli.register(require(`./commands/DispatchStatus`));

cli.runExit(process.argv.slice(2), {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
});
