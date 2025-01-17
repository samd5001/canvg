import puppeteer, {
	Browser,
	Page
} from 'puppeteer';

export function launch() {
	return puppeteer.launch({
		args: [
			'--no-sandbox ',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-web-security'
		]
	});
}

export async function createPage(browser: Browser) {

	const page = await browser.newPage();
	const {
		goto
	} = page;

	page.goto = (url, options) => Reflect.apply(goto, page, [
		url,
		{
			waitUntil: 'networkidle0',
			...options
		}
	]);

	await page.setViewport({
		width:  1280,
		height: 720
	});

	return page;
}

export function onPageError(page: Page, listener: (error: Error) => void) {
	page.on('console', (message) => {

		if (message.type() === 'error'
			|| message.type() === 'warning'
		) {
			listener(new Error(message.text()));
		}
	});
	page.on('error', listener);
	page.on('pageerror', listener);
}
