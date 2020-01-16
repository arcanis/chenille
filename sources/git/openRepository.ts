/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {PortablePath, npath, ppath, xfs} from '@yarnpkg/fslib';
import {Writable} from 'stream';
import chalk from 'chalk';
import cp from 'child_process';

import {Configuration, Git} from '../types';
import {getConfiguration} from '../getConfiguration';

export async function openRepository(dir: PortablePath, {stdout}: {stdout?: Writable} = {}): Promise<Git> {
  const nDir = npath.fromPortablePath(dir);

  const git = async (...args: string[]) => {
    if (stdout)
      stdout.write(`${chalk.grey(`$ git ${args.join(` `)}`)}\n`);

    const result = cp.execFileSync(`git`, args, {
      cwd: nDir,
      encoding: `utf8`,
      stdio: `pipe`,
    });

    if (process.env.DEBUG_TESTS) {
        console.log(`===`, ...args);
        console.log(result);
    }

    return result.trim();
  };

  git.prefixSquashMessage = async (prefix: string) => {
    const squashMessagePath = ppath.resolve(dir, `.git/SQUASH_MSG` as PortablePath);
    const squashMessage = await xfs.readFilePromise(squashMessagePath, `utf8`);

    await xfs.writeFilePromise(squashMessagePath, `${prefix}${squashMessage}`);
  };

  const config: Configuration = await getConfiguration(git);
  git.config = config;

  await git(`checkout`, git.config.branches.master);

  try {
    await git(`checkout`, git.config.branches.mergeQueue);
  } catch {
    await git(`checkout`, git.config.branches.mergeQueue, git.config.branches.master);
    await git(`branch`, `-u`, `origin/${git.config.branches.mergeQueue}`);
  }

  if (stdout) {
    const masterHash = await git(`rev-parse`, git.config.branches.master);
    stdout.write(`${masterHash} Branch: ${git.config.branches.master}\n`);

    const mergeQueueHash = await git(`rev-parse`, git.config.branches.mergeQueue);
    stdout.write(`${mergeQueueHash} Branch: ${git.config.branches.mergeQueue}\n`);
  }

  return git;
};
