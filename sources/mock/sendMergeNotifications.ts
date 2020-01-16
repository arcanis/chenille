/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git, Pr} from '../types';

export const sendMergeNotifications = async (mocks: any, git: Git, prs: Pr[]) => {
    if (!mocks.mergeNotifications)
        mocks.mergeNotifications = [];

    mocks.mergeNotifications.push(...prs);
};
