/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
module.exports = {
  name: `plugin-dd-license`,
  factory: require => ({
    hooks: {
      afterAllInstalled: async project => {
        const {Cache, Manifest, ThrowReport, structUtils} = require(`@yarnpkg/core`);
        const {ppath, xfs} = require(`@yarnpkg/fslib`);

        const configuration = project.configuration;
        const cache = await Cache.find(configuration);

        const fetcher = configuration.makeFetcher();
        const fetcherOptions = {fetcher, project, cache, checksums: new Map(), report: new ThrowReport()};

        const lines = [`Component,Origin,License,Copyright\n`];

        for (const locator of project.storedPackages.values()) {
          if (structUtils.isVirtualLocator(locator))
            continue;

          const fetchResult = await fetcher.fetch(locator, fetcherOptions);

          let manifest;
          try {
            manifest = await Manifest.find(fetchResult.prefixPath, {baseFs: fetchResult.packageFs});
          } finally {
            if (fetchResult.releaseFs) {
              fetchResult.releaseFs();
            }
          }

          const ident = structUtils.stringifyIdent(locator);
          const name = structUtils.stringifyLocator(locator);
          const license = manifest.raw.license;

          lines.push(`${name},https://yarnpkg.com/package/${ident},${license},\n`);
        }

        lines.sort();
        const csv = lines.join(``);

        const csvFile = ppath.join(project.cwd, `LICENSE-3rdparty.csv`);
        await xfs.writeFilePromise(csvFile, csv);
      },
    },
  }),
};
