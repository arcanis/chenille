/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
exports.sendCancelNotifications = async (prs) => {
    if (!global.__mocks__)
        global.__mocks__ = {};

    if (!global.__mocks__.notifications)
        global.__mocks__.notifications = [];

    global.__mocks__.notifications.push(...prs);
};
