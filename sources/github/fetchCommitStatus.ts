/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
import got from 'got';

import {DetailedPr, Git, Pr, StatusMap} from '../types';

export const fetchCommitStatus = async (git: Git, prs: Pr[]): Promise<DetailedPr[]> => {
  const repoString = process.env.GITHUB_REPOSITORY;
  if (typeof repoString === `undefined`)
    throw new Error(`Assertion failed: Missing GITHUB_REPOSITORY environment variable`);
  
  const repoToken = process.env.GITHUB_TOKEN;
  if (typeof repoToken === `undefined`)
    throw new Error(`Assertion failed: Missing GITHUB_TOKEN environment variable`);

  const [owner, name] = repoString.split(/\//);

  const {body} = await got.post(`https://api.github.com/graphql`, {
    json: true,
    headers: {
      Accept: `application/vnd.github.antiope-preview`,
      Authorization: `bearer ${repoToken}`,
    },
    body: {
      query: `query {
        rateLimit {
          cost
          remaining
        }
        repository(owner: "${owner}", name: "${name}") {
          ${prs.map(({hash}) => `
            hash_${hash}: object(oid: "${hash}") {
              ...on Commit {
                status {
                  contexts {
                    context
                    state
                    targetUrl
                  }
                }
                checkSuites(first: 100) {
                  nodes {
                    app {
                      name
                      description
                    }
                    checkRuns(first: 100) {
                      nodes {
                        title
                        summary
                        text
                        name
                        status
                        detailsUrl
                        conclusion
                      }
                    }
                  }
                }
              }
            }
          `).join(`\n`)}
        }
      }`,
    }
  });

  const {data} = body;
  console.log(require(`util`).inspect(data, {depth: Infinity}));

  const getStatusMapFor = (hash: string): StatusMap => {
    const entry = data.repository[`hash_${hash}`];
    const statusMap: StatusMap = new Map();

    if (entry.status !== null) {
      for (const {context, state, targetUrl} of entry.status.contexts) {
        switch (state) {
          case `SUCCESS`: {
            statusMap.set(context, {
              href: targetUrl,
              ok: true,
            });
          } break;

          case `FAILURE`:
          case `ERROR`: {
            statusMap.set(context, {
              href: targetUrl,
              ok: false,
            });
          } break;

          default: {
            statusMap.set(context, {
              href: targetUrl,
              ok: null,
            });
          } break;
        }
      }
    }

    for (const checkSuite of entry.checkSuites.nodes) {
      for (const checkRun of checkSuite.checkRuns.nodes) {
        const name = `${checkSuite.app.name} / ${checkRun.name}`;

        if (checkRun.status === `COMPLETED`) {
          statusMap.set(name, {
            href: checkRun.detailsUrl,
            ok: checkRun.conclusion === `SUCCESS`,
          });
        } else {
          statusMap.set(name, {
            href: checkRun.detailsUrl,
            ok: null,
          });
        }
      }
    }

    return statusMap;
  };

  return prs.map(pr => {
    return {...pr, statusMap: getStatusMapFor(pr.hash)};
  });
};
