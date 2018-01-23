const assert = require('assert');

const environment = require('./environment');

describe('E2E test development status', function () {
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

  it('Currently stopped because Spectron is not maintenanced. '
   + 'More tests will be added after maintenance of Spectron resumes.', function () {
    return new Promise((resolve, reject) => {
      assert(true);
      resolve();
    });
  });
});
