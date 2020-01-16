/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
export interface Configuration {
    requiredStatus?: string[];
    branches: {
        master: string;
        mergeQueue: string;
    };
} 
  
export interface Driver {
    fetchCommitStatus(git: Git, prs: Pr[]): Promise<DetailedPr[]>;
    fetchFromOrigin(git: Git, ...names: string[]): Promise<void>;
    pushToOrigin(git: Git, ...branches: string[]): Promise<void>;
    sendCancelNotifications(prs: CanceledPr[]): Promise<void>;
}

export interface Git {
    (...args: string[]): Promise<string>;
    prefixSquashMessage(prefix: string): Promise<void>;
    config: Configuration;
};
  
export type StatusMap =
    Map<string, boolean | null>;

export type Pr = {
    number: number;
    hash: string;
    title: string;
};

export type DetailedPr = Pr & {
    statusMap: StatusMap;
    status?: boolean | null;
};

export type CanceledPr = Pr & {
    reason: string;
};

