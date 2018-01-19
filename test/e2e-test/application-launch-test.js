const assert = require('assert');

const environment = require('./environment');

describe('application launch', function () {
  this.timeout(10000);

  beforeEach(function () {
    this.app = environment.getSpectronApp();
    return this.app.start();
  });

  // eslint-disable-next-line consistent-return
  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (actualWindowCount) {
      const minimumWindowCount = 1;
      assert(actualWindowCount >= minimumWindowCount);
    });
  });

  it('2nd test', function () {
    return new Promise((resolve, reject) => {
      assert(true);
      resolve();
    });
  });
});
