const {npath, xfs} = require(`@yarnpkg/fslib`);
const {execFileSync} = require(`child_process`);
const {PassThrough} = require(`stream`);

global.makeTemporaryEnv = (fixture, cb) => {
  return async () => {
    const path = await xfs.mktempPromise();

    const nRepoPath = npath.fromPortablePath(path);
    const nScriptPath = require.resolve(`./fixtures/${fixture}.sh`);

    execFileSync(`bash`, [nScriptPath], {cwd: nRepoPath, stdio: `pipe`});

    const {openRepository} = require(`./sources/git/openRepository`);
    const git = await openRepository(path);

    const context = process.env.FORWARD_STREAMS ? {
      cwd: path,
      driver: require(`./sources/mock/driver`),
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr,
    } : {
      cwd: path,
      driver: require(`./sources/mock/driver`),
      stdin: new PassThrough(),
      stdout: new PassThrough(),
      stderr: new PassThrough(),
    };

    await cb({path, git, context});
  };
};
