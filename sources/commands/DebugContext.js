const {Command} = require(`clipanion`);
const {inspect} = require(`util`);

const {getEventFile} = require(`../getEventFile`);

class DebugContext extends Command {
  async execute() {
    const eventFile = getEventFile();

    this.context.stdout.write(inspect(eventFile, {
      depth: Infinity,
    }) + `\n`);
  }
}

DebugContext.addPath(`debug`, `context`);

module.exports = DebugContext;
