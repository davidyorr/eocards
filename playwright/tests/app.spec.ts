import { expect, test } from "playwright/fixtures/supabase-fixture";
import { takeScreenshotOnFailure } from "./util";

test.afterEach(takeScreenshotOnFailure);

test("something", async ({ createUser, page }) => {
	const user = await createUser();

	// log in
	await page.goto("http://localhost:8080/login");
	await page.getByPlaceholder("email").fill(user.email);
	await page.getByPlaceholder("password").fill(user.password);
	await page.getByRole("button", { name: "Log In" }).click();

	// create a deck
	await expect(page).toHaveURL("http://localhost:8080/");
	await page.getByRole("button", { name: "New Deck" }).click();
	await page.getByPlaceholder("name").fill("Chrono Trigger");
	await page.getByAltText("confirm").click();

	// navigate to the edit page
	await expect(page).toHaveURL(/http:\/\/localhost:8080\/deck\/edit\/[0-9]+/);
	await expect(page.getByText("Deck Editor")).toBeVisible();

	// add attribute
	await page.getByPlaceholder("name").fill("Magical Element");
	await page.getByRole("button", { name: "Add Attribute" }).click();
	await expect(page.locator(".attributes-container")).toHaveText(
		"Magical Element - text",
	);

	// add cards
	await page.getByRole("button", { name: "New Card" }).click();
	await page.getByRole("button", { name: "New Card" }).click();

	const frontLabel = page.locator("label", { hasText: "Front" });
	const magicLabel = page.locator("label", { hasText: "Magical Element" });

	let parent = page
		.locator(".input-container")
		.filter({ has: frontLabel })
		.nth(0);
	await parent.getByRole("textbox").fill("Crono");

	parent = page.locator(".input-container").filter({ has: magicLabel }).nth(0);
	await parent.getByRole("textbox").fill("Light");

	parent = page.locator(".input-container").filter({ has: frontLabel }).nth(1);
	await parent.getByRole("textbox").fill("Marle");

	parent = page.locator(".input-container").filter({ has: magicLabel }).nth(1);
	await parent.getByRole("textbox").fill("Water (Ice)");

	// save deck and cards
	await page.getByRole("button", { name: "Save Deck" }).click();
	await expect(
		page.locator(".notification", { hasText: "Saved Deck" }),
	).toHaveCount(1);

	// check that the deck name input has the correct initial value before editing
	await expect(page.getByLabel("Deck Name:")).toHaveValue("Chrono Trigger");

	// edit the deck name
	await page.getByLabel("Deck Name:").fill("Chrono Trigger Remastered");
	await page.getByRole("button", { name: "Save Deck" }).click();

	// navigate back to the dashboard to verify the name change
	await page.goto("/");
	await expect(page).toHaveURL("http://localhost:8080/");

	// check that the deck with the new name is visible on the dashboard
	const deckOnDashboard = page.getByText("Chrono Trigger Remastered", {
		exact: true,
	});
	await expect(deckOnDashboard).toBeVisible();

	// check that the old name is not present
	await expect(
		page.getByText("Chrono Trigger", { exact: true }),
	).not.toBeVisible();

	// from the dashboard, click the deck name to navigate to the review page
	await deckOnDashboard.click();
	await expect(page).toHaveURL(/http:\/\/localhost:8080\/deck\/review\/[0-9]+/);

	const cardText = page.getByTestId("card-text");

	await expect(cardText).toHaveText("Crono");
	await page.locator(".flip-button").click();
	await expect(cardText).toHaveText("Light");
	await page.locator(".next-button").click();
	await expect(cardText).toHaveText("Marle");
	await page.locator(".flip-button").click();
	await expect(cardText).toHaveText("Water (Ice)");
	await page.locator(".next-button").click();
	await expect(cardText).toHaveText("Crono");
});
