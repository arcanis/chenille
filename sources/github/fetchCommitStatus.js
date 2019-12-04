const got = require(`got`);

exports.fetchCommitStatus = async (git, prs) => {
  const [owner, name] = process.env.GITHUB_REPOSITORY.split(/\//);

  const {body} = await got.post(`https://api.github.com/graphql`, {
    json: true,
    headers: {
      Accept: `application/vnd.github.antiope-preview`,
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
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
                  }
                }
                checkSuites(first: 100) {
                  nodes {
                    app {
                      name
                    }
                    checkRuns(first: 100) {
                      nodes {
                        name
                        status
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

  console.log(body);
  const {data} = body;

  const getStatusMapFor = hash => {
    const entry = data.repository[`hash_${hash}`];
    const statusMap = new Map();

    for (const {context, state} of entry.status.contexts) {
      switch (state) {
        case `SUCCESS`: {
          statusMap.set(context, true);
        } break;

        case `FAILURE`:
        case `ERROR`: {
          statusMap.set(context, false);
        } break;

        default: {
          statusMap.set(context, false);
        } break;
      }
    }

    for (const checkSuite of entry.checkSuites.nodes) {
      for (const checkRun of checkSuite.checkRuns.nodes) {
        const name = `${checkSuite.app.name} / ${checkRun.name}`;

        if (checkRun.status === `COMPLETED`) {
          statusMap.set(name, checkRun.conclusion === `SUCCESS`);
        } else {
          statusMap.set(name, null);
        }
      }
    }

    return statusMap;
  };
  
  return prs.map(pr => {
    return {...pr, statusMap: getStatusMapFor(pr.hash)};
  });
};
