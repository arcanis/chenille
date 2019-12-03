const {npath, ppath, xfs} = require(`@yarnpkg/fslib`);
const chalk = require(`chalk`);
const cp = require(`child_process`);

exports.openRepository = async (dir, {stdout}) => {
  const nDir = npath.fromPortablePath(dir);

  const git = async (...args) => {
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

  git.prefixSquashMessage = async prefix => {
    const squashMessagePath = ppath.resolve(dir, `.git/SQUASH_MSG`);
    const squashMessage = await xfs.readFilePromise(squashMessagePath, `utf8`);

    await xfs.writeFilePromise(squashMessagePath, `${prefix}${squashMessage}`);
  };

  await git(`checkout`, `master`);

  try {
    await git(`checkout`, `merge-queue`);
  } catch {
    await git(`checkout`, `merge-queue`, `master`);
    await git(`branch`, `-u`, `origin/merge-queue`);
  }

  const masterHash = await git(`rev-parse`, `master`);
  stdout.write(`${masterHash} Branch: master\n`);

  const mergeQueueHash = await git(`rev-parse`, `merge-queue`);
  stdout.write(`${mergeQueueHash} Branch: merge-queue\n`);

  return git;
};
