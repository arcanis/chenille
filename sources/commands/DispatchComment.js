const {Command} = require(`clipanion`);

class DispatchComment extends Command {
    async execute() {
    }
}

DispatchComment.addPath(`dispatch`, `comment`);

module.exports = DispatchComment;
