const NodeEnvironment = require('jest-environment-node');
const { DetoxCircusEnvironment } = require('detox/runners/jest');

class CustomDetoxEnvironment extends DetoxCircusEnvironment {
  constructor(config, context) {
    super(config, context);

    // This takes care of generating status logs on a per-spec basis. By default, jest only reports at file-level.
    this.registerListeners({
      STARTED: (event) => {
        console.log('Test started:', event.test.name);
      },
      DONE: (event, state) => {
        if (state.error) {
          console.log('Test failed:', event.test.name, state.error);
        } else {
          console.log('Test passed:', event.test.name);
        }
      },
    });
  }
}

module.exports = CustomDetoxEnvironment;
