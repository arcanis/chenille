/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {PortablePath, npath} from '@yarnpkg/fslib';
import {BaseContext, Cli} from 'clipanion';

export type Context = BaseContext & {
  cwd: PortablePath,
};

const cli = new Cli<Context>({binaryName: `yarn chenille`});

cli.register(require(`./commands/DispatchComment`));

cli.register(require(`./commands/SyncAgainstMaster`));
cli.register(require(`./commands/SyncAgainstQueue`));

cli.register(require(`./commands/Cancel`));
cli.register(require(`./commands/Queue`));

export default cli;

if (process.mainModule === module) {
  cli.runExit(process.argv.slice(2), {
    cwd: npath.toPortablePath(process.cwd()),
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  });
}
