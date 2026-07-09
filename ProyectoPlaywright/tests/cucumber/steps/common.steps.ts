import { Given } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../support/world';
import { Navigate } from '../../screenplay/tasks/navigate';

Given('the user navigates to {string}', async function (this: PlaywrightWorld, url: string) {
  await this.actor.attemptsTo(Navigate.to(url));
});
