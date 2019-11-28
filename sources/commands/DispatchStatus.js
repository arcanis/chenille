const {Command} = require(`clipanion`);

class DispatchStatus extends Command {
    async execute() {
    }
}

DispatchStatus.addPath(`dispatch`, `status`);

module.exports = DispatchStatus;
