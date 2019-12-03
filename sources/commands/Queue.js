const {npath} = require(`@yarnpkg/fslib`);
const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {openRepository} = require(`../git/openRepository`);
const {removeFromMergeQueue} = require(`../git/removeFromMergeQueue`);
const {sendToMergeQueue} = require(`../git/sendToMergeQueue`);

class Queue extends Command {
  async execute() {
    const git = await openRepository(npath.toPortablePath(this.cwd));

    const remote = `pull/${this.pr}/head`;
    const local = `pr-${this.pr}`;

    this.context.stdout.write(`Fetching the head for ${remote}...\n`);
    await git(`fetch`, `origin`, `${remote}:${local}`);

    this.context.stdout.write(`Removing ${this.pr} from the merge queue (if needed)...\n`);
    await removeFromMergeQueue(git, this.pr);

    this.context.stdout.write(`Squashing ${this.pr} into the merge queue (${await git(`rev-parse`, `--short`, local)})...\n`);
    await sendToMergeQueue(git, {number: this.pr, title: this.number}, local);

    this.context.stdout.write(`Done - pushing the changes!\n`);
    await git(`push`, `merge-queue`, `origin:merge-queue`);
  }
}

Queue.schema = yup.object().shape({
  cwd: yup.string().required(),
  title: yup.string().required(),
  pr: yup.number().required(),
});

Queue.addPath(`queue`);

Queue.addOption(`cwd`, Command.String(`--cwd`));
Queue.addOption(`title`, Command.String(`--title`));
Queue.addOption(`pr`, Command.String());

module.exports = Queue;
