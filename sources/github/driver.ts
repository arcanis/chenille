/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Driver} from '../types';

import {fetchCommitStatus} from './fetchCommitStatus';
import {fetchFromOrigin} from './fetchFromOrigin';
import {pushToOrigin} from './pushToOrigin';
import {sendCancelNotifications} from './sendCancelNotifications';
import {sendMergeNotifications} from './sendMergeNotifications';

export const driver: Driver = {
    fetchCommitStatus,
    fetchFromOrigin,
    pushToOrigin,
    sendCancelNotifications,
    sendMergeNotifications,
};
