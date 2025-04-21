import { expect, test } from "playwright/fixtures/supabase-fixture";
import { takeScreenshotOnFailure } from "./util";

test.afterEach(takeScreenshotOnFailure);

test("user settings", async ({ createUser, page }) => {
	const user = await createUser();

	await page.goto("http://localhost:8080/login");
	await page.getByPlaceholder("email").fill(user.email);
	await page.getByPlaceholder("password").fill(user.password);
	await page.getByRole("button", { name: "Log In" }).click();
	await expect(page).toHaveURL("http://localhost:8080/");

	// change settings
	await page.locator(".user-options-container").click();
	await page.locator(".preferences").click();
	await expect(page.locator(".user-options")).toBeHidden();
	await expect(page.locator(".settings-modal")).toBeVisible();
	await expect(page.getByLabel("Dark Mode")).not.toBeChecked();
	await page.getByLabel("Dark Mode").check();
	await page.getByRole("button", { name: "Save" }).click();
	await expect(
		page.locator(".notification", { hasText: "User settings updated" }),
	).toHaveCount(1);
	await page.locator(".modal-overlay").click({ position: { x: 0, y: 0 } });
	await expect(page.locator(".settings-modal")).toBeHidden();

	// check that the settings changed
	await page.locator(".user-options-container").click();
	await page.locator(".preferences").click();
	await expect(page.locator(".user-options")).toBeHidden();
	await expect(page.locator(".settings-modal")).toBeVisible();
	await expect(page.getByLabel("Dark Mode")).toBeChecked();
});
