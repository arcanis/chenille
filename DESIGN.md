# Design

  - Chenille is packaged as a reusable action. When configured in a repository workflow, it'll boot through [actionEntry](/sources/github/actionEntry.js). This file will select which logic to apply based on the trigger:

  - Actions are implemented as a CLI. This will make it very easy later on to implement merge queue CLI controls.

  - The GitHub-specific logic is implemented through a "driver" system. The driver is set by the entry point (cf [actionEntry](/sources/github/actionEntry.js#L14)). Doing this will allow us to port Chenille to various systems as needed.

  - Implementing a true merge queue isn't possible given the tools that we currently have (GitHub offers no guarantee that the webhooks are received in the right order, and GitHub Actions don't provide concurrency control on a per-workflow basis). As a result, Chenille uses a different stategy by using `--force-with-lease` to ensure that the repository is in a consistent state from the beginning to the end for each action. If Git detects that we're operating on stale data, we simply fetch the branches again and retry until we're sure our changes got properly applied.
