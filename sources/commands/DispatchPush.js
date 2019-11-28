const {Command} = require(`clipanion`);

class DispatchPush extends Command {
    async execute() {
    }
}

DispatchPush.addPath(`dispatch`, `push`);

module.exports = DispatchPush;
