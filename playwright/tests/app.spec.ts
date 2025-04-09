import { expect, test } from "playwright/fixtures/supabase-fixture";

test("something", async ({ createUser, page }) => {
	const user = await createUser();

	await page.goto("http://localhost:8080/login");
	await page.getByPlaceholder("email").fill(user.email);
	await page.getByPlaceholder("password").fill(user.password);
	await page.getByRole("button", { name: "Log In" }).click();

	await page.waitForURL("http://localhost:8080/");
	await page.getByRole("button", { name: "New Deck" }).click();
	await page.getByPlaceholder("name").fill("Chrono Trigger");
	await page.getByRole("button", { name: "Create Deck" }).click();

	await page.waitForURL(/http:\/\/localhost:8080\/deck\/edit\/[0-9]+/);
	await expect(page.getByText("Deck Editor Chrono Trigger")).toBeVisible();
});
