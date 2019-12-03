const {npath, xfs} = require(`@yarnpkg/fslib`);
const {execFileSync} = require(`child_process`);

global.makeTemporaryEnv = (fixture, cb) => {
  return async () => {
    const path = await xfs.mktempPromise();

    const nRepoPath = npath.fromPortablePath(path);
    const nScriptPath = require.resolve(`./fixtures/${fixture}.sh`);

    execFileSync(`bash`, [nScriptPath], {cwd: nRepoPath, stdio: `pipe`});

    const {openRepository} = require(`./sources/git/openRepository`);
    const git = openRepository(path);

    await cb({path, git});
  };
};
