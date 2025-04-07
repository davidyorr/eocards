import { expect, test } from "playwright/fixtures/supabase-fixture";

test("something", async ({ createUser, page }) => {
	const user1 = await createUser();

	await page.goto("http://localhost:8080/");

	await page.goto("http://localhost:8080/login");
	await page.getByPlaceholder("email").fill(user1.email);
	await page.getByPlaceholder("password").fill(user1.password);
	await page.getByRole("button", { name: "Log In" }).click();

	await page.waitForURL("http://localhost:8080/");
	expect(page.getByRole("button", { name: "New Deck" })).toBeVisible();
});
