/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import {Git} from '../types';

exports.pushToOrigin = async (mocks: any, git: Git, ...args: string[]) => {
    await git(`push`, `origin`, ...args);
};
