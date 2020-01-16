/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Driver} from '../types';

export const makeDriver: (mocks: any) => Driver = mocks => ({
  fetchCommitStatus: require(`./fetchCommitStatus`).fetchCommitStatus.bind(null, mocks),
  fetchFromOrigin: require(`./fetchFromOrigin`).fetchFromOrigin.bind(null, mocks),
  pushToOrigin: require(`./pushToOrigin`).pushToOrigin.bind(null, mocks),
  sendMergeNotifications: require(`./sendMergeNotifications`).sendMergeNotifications.bind(null, mocks),
  sendCancelNotifications: require(`./sendCancelNotifications`).sendCancelNotifications.bind(null, mocks),
});
