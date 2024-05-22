# bh-releaser

## Description

This project provides a [release-it](https://github.com/release-it/release-it) wrapper preconfigured for use by Blue Halo app development teams.

Creating a release for a GitLab project using `bh-releaser` will:

- Find the last tag
- Find all merge commits since the last tag
- Find all issues closed by those merge commits
- Create a changelog that lists all closed issues with links to each issue
- Bump the version in package.json
- Commit the version bump
- Create a tag
- Create a GitLab release

## Configuration

This package follows the configuration setup provided by release-it.

The script requires the user to have a Gitlab Access Token available and set to the `GITLAB_TOKEN` environment variable. Generate an Access Token with the following scopes: api, read_repository, write_repository.

Additionally the consuming project must provide its GitLab Project ID.
The recommended way to provide the Project ID is to create a `.release-it.json` configuration file in the consuming project and provide the projectId to the plug-in, like so:

```
{
    "plugins": {
        "@bluehalo/bh-releaser/gl-issue-changelog": {
            "projectId": 6094
        }
    }
}
```

The Project ID can also be configured using the `CI_PROJECT_ID` environment variable to support GitLab CI/CD without the need for a `.release-it.json` file.

## Usage

The `bh-releaser` command provides the following command line options:

- `-h` - display help
- `-d` - dry-run the release, print to std out

Running the `bh-releaser` command will trigger a release for the consuming project. This will attempt to perform a version bump, create a git tag and a gitlab release.

The suggested usage is to run the following command in the project you wish to generate a release for:

```
npx --yes @bluehalo/bh-releaser@latest
```

CI/CD integration is coming soon...
