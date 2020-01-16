/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {CanceledPr, Git} from '../types';

export const sendCancelNotifications = async (mocks: any, git: Git, prs: CanceledPr[]) => {
    if (!mocks.cancelNotifications)
        mocks.cancelNotifications = [];

    mocks.cancelNotifications.push(...prs);
};
