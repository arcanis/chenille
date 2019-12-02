const got = require(`got`);

exports.fetchCommitStatus = (prs) => {
  const [owner, name] = process.env.GITHUB_REPOSITORY.split(/\//);

  await got.post(`https://api.github.com/graphql`, {
    headers: {
      Accept: `application/vnd.github.antiope-preview`,
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
    },
    json: {
      query: `query {
        rateLimit {
          cost
          remaining
        }
        repository(owner: "${owner}", name: "${name}") {
          ${prs.map(({hash}) => `
            hash_${hash}: object(oid: "${hash}") {
              checkSuites(first: 3) {
                nodes {
                  app {
                    name
                  }
                }
              }
            }
          `).join(`\n`)}
        }
      }`,
    }
  });
};
