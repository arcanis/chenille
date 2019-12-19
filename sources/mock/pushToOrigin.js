exports.pushToOrigin = async (git, ...args) => {
    await git(`push`, `origin`, ...args);
};
