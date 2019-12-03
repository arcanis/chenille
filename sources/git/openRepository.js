const {npath, ppath, xfs} = require(`@yarnpkg/fslib`);
const cp = require(`child_process`);

exports.openRepository = async dir => {
  const nDir = npath.fromPortablePath(dir);

  const git = async (...args) => {
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

  await git(`checkout`, `merge-queue`);
  await git(`checkout`, `master`);
 
  return git;
};
