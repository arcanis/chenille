/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {CanceledPr} from '../types';

exports.sendCancelNotifications = async (mocks: any, prs: CanceledPr[]) => {
    if (!mocks.notifications)
        mocks.notifications = [];

    mocks.notifications.push(...prs);
};
