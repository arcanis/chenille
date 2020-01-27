# Chenille

Chenille is a merge queue system based on GitHub actions (although quite loosely, so you could adapt it to different systems thanks to its driver system). It prevents you from merging incompatible pull requests by always running your tests against the true master (by opposition to master at the time you pushed the last commit in the PR).

> **Practical case:** Imagine you have a PR that adds an ESLint rule to your project, and another PR that happen to contain code that violate the rule. Both PR will be green against master, and it's only once you merge them both that you'll see that master broke. To fix that you could enable "Require branches to be up-to-date before merging" in the GitHub settings, but it's not possible when working with many committers as your PRs would always end up being rebased again and again.

It's very similar to [Ship-it](https://github.com/Shopify/shipit-engine) or [Bors](https://bors.tech/essay/2017/02/02/pitch/), but the integration with GitHub is extremely simple (in particular you don't need to setup any server, as Chenille is stateless).

## Install

1. Create a bot user (that's optional; you can also use your own account)

2. Register a [PAT](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) as [repository secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) (we'll assume it's named `CHENILLE_TOKEN`)

3. Create a GitHub workflow similar to the following:

```yaml
name: Chenille

on:
    push:
      branches:
      - master
    pull_request:
      types: [synchronize]
    issue_comment:
    schedule:
    - cron: '*/30 * * * *'

jobs:
  chenille:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v1
    - name: Chenille
      uses: arcanis/chenille@master
      env:
        GITHUB_TOKEN: ${{ secrets.CHENILLE_TOKEN }}
```

Note that the `*/30` segment means "every 30 minutes". It means that Chenille will synchronize the merge queue with master every 30 minutes. When working with an enterprise account, you might want to increase to the frequency (the lower you can go is once every five minutes).

## Usage

Just create your PRs as you usually do. When you're done and want to merge your work into `master`, post `/chenille` as comment of your PR. Chenille will pick it up and squash your PR on top of a branch named `mege-queue`. Once your other regular tests will have run on this commit, Chenille will detect it and synchronize `master` to point to the most recent green commit in `merge-queue`.

Should a PR in your merge queue be reported as red Chenille will remove it and send a comment on the PR to notify you of the problem. It'll then rebase all the subsequent squashes on top of the new head, which will trigger new tests, and the process will repeat until `merge-queue` is fully synchronized with `master`.

Pushing a commit into a PR already in the merge queue will cause Chenille to cancel its merge (you'll get a comment too), so you'll need to re-enqueue it by sending `/chenille` again.

## Configuration

By default Chenille will check that all the tests are green, but you can filter the list by creating a `chenille.yml` file at the root of the `master` branch:

```yaml
requiredStatus:
  - GitHub Actions / test
```

You can also configure custom `master` and `merge-queue` branches by using the `with:` block in your workflow:

```yaml
jobs:
  chenille:
    steps:
    - name: Chenille
      uses: arcanis/chenille@master
      with:
          master: prod
          mergeQueue: merge-queue
      env:
        GITHUB_TOKEN: ${{ secrets.CHENILLE_TOKEN }}

```

## License (MIT)

> **Copyright © 2019 Datadog**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
