const {npath, ppath, xfs} = require(`@yarnpkg/fslib`);
const chalk = require(`chalk`);
const cp = require(`child_process`);

const {getConfiguration} = require(`../getConfiguration`);

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

  git.config = await getConfiguration(git);

  await git(`checkout`, git.config.branches.master);

  try {
    await git(`checkout`, git.config.branches.mergeQueue);
  } catch {
    await git(`checkout`, git.config.branches.mergeQueue, git.config.branches.master);
    await git(`branch`, `-u`, `origin/${git.config.branches.mergeQueue}`);
  }

  const masterHash = await git(`rev-parse`, git.config.branches.master);
  stdout.write(`${masterHash} Branch: ${git.config.branches.master}\n`);

  const mergeQueueHash = await git(`rev-parse`, git.config.branches.mergeQueue);
  stdout.write(`${mergeQueueHash} Branch: ${git.config.branches.mergeQueue}\n`);

  return git;
};
