exports.fetchFromOrigin = async (git, ...args) => {
    await git(`fetch`, `origin`, ...args);
};
