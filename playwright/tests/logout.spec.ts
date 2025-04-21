import { expect, test } from "playwright/fixtures/supabase-fixture";
import { takeScreenshotOnFailure } from "./util";

test.afterEach(takeScreenshotOnFailure);

test("logging in and logging out", async ({ createUser, page }) => {
	const user = await createUser();

	await page.goto("http://localhost:8080/login");
	await page.getByPlaceholder("email").fill(user.email);
	await page.getByPlaceholder("password").fill(user.password);
	await page.getByRole("button", { name: "Log In" }).click();
	await expect(page).toHaveURL("http://localhost:8080/");
	await page.locator(".user-options-container").click();
	await page.locator(".user-options-container .logout").click();
	await page.waitForURL("http://localhost:8080/login");
	await expect(page.locator(".user-options-container")).toHaveCount(0);
});
