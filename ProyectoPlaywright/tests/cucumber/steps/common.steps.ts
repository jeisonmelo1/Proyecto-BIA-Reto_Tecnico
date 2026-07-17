import 'dotenv/config';
import { Given } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../support/world';
import { Navigate } from '../../screenplay/tasks/navigate';

Given('the user navigates to {string}', async function (this: PlaywrightWorld, url: string) {
  // Use BASE_URL from .env if url is 'default' or empty
  const finalUrl = (url === 'default' || !url) ? (process.env.BASE_URL || url) : url;
  await this.actor.attemptsTo(Navigate.to(finalUrl));
});
