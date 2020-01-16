/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git, Pr} from '../types';

export const fetchCommitStatus = (mocks: any, git: Git, prs: Array<Pr>) => {
    return prs.map(pr => ({
        ...pr,
        statusMap: mocks.status
            ? mocks.status.get(pr.number) || new Map()
            : new Map(),
    }));
};
