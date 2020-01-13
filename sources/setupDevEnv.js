/**
 * Unless explicitly stated otherwise all files in this repository are licensed under the MIT License.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright (c) 2020-Present Datadog, Inc.
 */
const path = require(`path`);
const root = path.dirname(__dirname);

console.log(`Setup of @babel/register done`);
process.env.DEBUG = `*`;

require(`@babel/register`)({
  root,
  extensions: [`.ts`, `.js`],
});
