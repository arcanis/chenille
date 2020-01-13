/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
exports.fetchCommitStatus = function (git, prs) {
    return prs.map(pr => ({
        ...pr,
        statusMap: global.__mocks__ && global.__mocks__.status
            ? global.__mocks__.status.get(pr.number) || new Map()
            : new Map(),
    }));
};
