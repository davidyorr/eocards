import { TestInfo, Page } from "@playwright/test";

export async function takeScreenshotOnFailure(
	{ page }: { page: Page },
	testInfo: TestInfo,
) {
	if (testInfo.status !== testInfo.expectedStatus) {
		const path = testInfo.outputPath("failure.png");
		console.log("saving test failure screenshot", path);
		await page.screenshot({ path: path });
	}
}
