import { After, Before, setDefaultTimeout } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world';

setDefaultTimeout(60 * 1000);

Before(async function (this: PlaywrightWorld) {
  await this.init();
});

After(async function (this: PlaywrightWorld) {
  await this.close();
});
