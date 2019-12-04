const {Command} = require(`clipanion`);
const yup = require(`yup`);

const {bailoutWorkflow} = require(`../bailoutWorkflow`);

class DispatchComment extends Command {
  async execute() {
    const command = this.body.match(/^\/chenille(\s|$)/m);
    if (command === null)
      return bailoutWorkflow(this.context.stdout, `No command found`);

    return await this.cli.run([`queue`, this.pr, `--title=${this.title}`]);
  }
}

DispatchComment.schema = yup.object().shape({
  title: yup.string().required(),
  body: yup.string().required(),
  pr: yup.number().required(),
});

DispatchComment.addPath(`dispatch`, `comment`, `to`);

DispatchComment.addOption(`title`, Command.String(`--title`));
DispatchComment.addOption(`body`, Command.String(`--body`));
DispatchComment.addOption(`pr`, Command.String());

module.exports = DispatchComment;
