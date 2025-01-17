import './common/imageSnapshot';
import path from 'path';
import {
	Browser,
	Page
} from 'puppeteer';
import {
	Server,
	base64ToBuffer,
	ignoreErrors
} from './common';
import {
	launch,
	createPage,
	onPageError
} from './common/puppeteer';
import svgs from './svgs.json';

async function render(page: Page, file: string) {

	const url = `http://localhost:${Server.defaultPort}/test/browser/?no-ui&no-svg&redraw=false&render=offscreen&url=${path.join('..', 'svgs', file)}`;

	return new Promise<Buffer>(async (resolve, reject) => {

		onPageError(page, (err) => {

			const {
				message
			} = err;

			if (ignoreErrors.every(_ => !_.test(message))) {
				reject(err);
			}
		});

		try {

			await page.goto(url);
			await page.waitForSelector('#svg svg');

			const base64 = await page.evaluate(async () => {

				const c = document.querySelector('img');
				const response = await fetch(c.src);
				const blob = await response.blob();

				return new Promise((resolve, reject) => {

					const reader = new FileReader();

					reader.onerror = reject;
					reader.onload = () => {
						resolve(reader.result);
					};
					reader.readAsDataURL(blob);
				});
			}) as string;

			resolve(base64ToBuffer(base64));
		} catch (err) {
			reject(err);
		}
	});
}

jest.setTimeout(30000);

describe('canvg', () => {

	describe('browser', () => {

		describe('offscreen', () => {

			if (process.platform !== 'linux') {
				it('should run screenshots testing only on CI (linux)', () => {});
				return;
			}

			let browser: Browser = null;
			let page: Page = null;
			let server: Server = null;

			beforeAll(async () => {

				server = new Server();
				await server.listen();

				browser = await launch();
			});

			beforeEach(async () => {
				page = await createPage(browser);
			});

			afterAll(async () => {

				await browser.close();
				server.close();

				browser = null;
				server = null;
			});

			afterEach(async () => {

				if (page) {
					await page.close();
					page = null;
				}
			});

			for (const type in svgs) {

				const svgsOfType = svgs[type];

				for (const svg in svgsOfType) {

					const description = svgsOfType[svg];

					it(`should render ${description}`, async () => {

						expect(
							await render(page, svg)
						).toMatchImageSnapshot({
							customSnapshotIdentifier: `offscreen-browser-${svg}`
						});
					});
				}
			}
		});
	});
});
