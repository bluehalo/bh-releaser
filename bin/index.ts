#!/usr/bin/env tsx

import parseArgs from "yargs-parser";
import release from "release-it";
import fs from "node:fs";
import _ from "lodash";

const readJSON = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const pkg = readJSON(new URL("../package.json", import.meta.url));

const aliases = {
  d: "dry-run",
  h: "help",
  V: "verbose",
};

const helpText = `BlueHalo Release It! v${pkg.version}

  This is a preconfigured version of Release It(https://github.com/release-it/release-it) for use by BlueHalo teams to streamline
  the release process.

  Usage: bh-release-it [options]

  Use e.g. "release-it minor" directly as shorthand for "release-it --increment=minor".

  -d --dry-run           Do not touch or write anything, but show the commands
  -h --help              Print this help
  -V --verbose           Verbose output (user hooks output)

For more details, please see https://github.com/bluehalo/bh-releaser
`;

/** @internal */
export const help = () => console.log(helpText);

const parseCliArguments = (args) => {
  const options = parseArgs(args, {
    boolean: ["dry-run"],
    alias: aliases,
    configuration: {
      "parse-numbers": false,
      "camel-case-expansion": false,
    },
  });
  if (options.V) {
    options.verbose =
      typeof options.V === "boolean" ? options.V : options.V.length;
    delete options.V;
  }
  return options;
};

const options = parseCliArguments([].slice.call(process.argv, 2));

const token = process.env.GITLAB_TOKEN || undefined;
const apiUrl = process.env.CI_API_V4_URL || undefined;
const projectId = process.env.CI_PROJECT_ID || undefined;

const defaultConfig = {
  npm: {
    ignoreVersion: true,
  },
  git: {
    commitMessage: "chore(release): v${version} [skip ci]",
    requireCleanWorkingDir: false,
    changelog: 'git log --pretty=format:"%h" ${from}...${to}',
  },
  gitlab: {
    release: true,
  },
  plugins: {
    "@bluehalo/bh-releaser/bh-calver": {},
    "@bluehalo/bh-releaser/gl-issue-changelog": {
      token,
      apiUrl,
      projectId,
    },
  },
  ci: true,
};

if (options.help) {
  help();
} else {
  release(_.merge({}, defaultConfig, options)).then((output) => {
    console.log(output);
  });
}
