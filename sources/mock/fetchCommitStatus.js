exports.fetchCommitStatus = function (git, prs) {
    return prs.map(pr => ({
        ...pr,
        statusMap: global.__mocks__ && global.__mocks__.status
            ? global.__mocks__.status.get(pr.number) || new Map()
            : new Map(),
    }));
};
