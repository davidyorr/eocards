import { expect, test } from "playwright/fixtures/supabase-fixture";
import { takeScreenshotOnFailure } from "./util";

test.afterEach(takeScreenshotOnFailure);

test("create and review speedster deck", async ({ createUser, page }) => {
	const user = await createUser();

	// log in
	await page.goto("http://localhost:8080/login");
	await page.getByPlaceholder("email").fill(user.email);
	await page.getByPlaceholder("password").fill(user.password);
	await page.getByRole("button", { name: "Log In" }).click();

	// create a deck
	await expect(page).toHaveURL("http://localhost:8080/");
	await page.getByRole("button", { name: "New Deck" }).click();
	await page.getByPlaceholder("name").fill("Speedsters");
	await page.getByAltText("confirm").click();

	// navigate to the edit page
	await expect(page).toHaveURL(/http:\/\/localhost:8080\/deck\/edit\/[0-9]+/);
	await expect(page.getByText("Deck Editor")).toBeVisible();

	// --- ADD ATTRIBUTES ---

	// Attribute 1: Secret Identity (This will be visible in Review)
	await page.getByPlaceholder("name").fill("Secret Identity");
	await page.getByRole("button", { name: "Add Attribute" }).click();

	// Attribute 2: Lightning Color (We save this, but don't check it in Review yet)
	await page.getByPlaceholder("name").fill("Lightning Color");
	await page.getByRole("button", { name: "Add Attribute" }).click();

	// Check that attributes are listed in the editor
	await expect(page.locator(".attributes-container")).toContainText(
		"Secret Identity - text",
	);
	await expect(page.locator(".attributes-container")).toContainText(
		"Lightning Color - text",
	);

	// --- ADD CARDS ---
	await page.getByRole("button", { name: "New Card" }).click();
	await page.getByRole("button", { name: "New Card" }).click();

	// Helper labels for locating inputs
	const frontLabel = page.locator("label", { hasText: "Front" });
	const identityLabel = page.locator("label", { hasText: "Secret Identity" });
	const colorLabel = page.locator("label", { hasText: "Lightning Color" });

	// --- FILL CARD 1 (The Flash) ---
	let parent = page
		.locator(".input-container")
		.filter({ has: frontLabel })
		.nth(0);
	await parent.getByRole("textbox").fill("The Flash");

	parent = page
		.locator(".input-container")
		.filter({ has: identityLabel })
		.nth(0);
	await parent.getByRole("textbox").fill("Barry Allen");

	parent = page.locator(".input-container").filter({ has: colorLabel }).nth(0);
	await parent.getByRole("textbox").fill("Yellow");

	// --- FILL CARD 2 (Reverse-Flash) ---
	parent = page.locator(".input-container").filter({ has: frontLabel }).nth(1);
	await parent.getByRole("textbox").fill("Reverse-Flash");

	parent = page
		.locator(".input-container")
		.filter({ has: identityLabel })
		.nth(1);
	await parent.getByRole("textbox").fill("Eobard Thawne");

	parent = page.locator(".input-container").filter({ has: colorLabel }).nth(1);
	await parent.getByRole("textbox").fill("Red");

	// save deck and cards
	await page.getByRole("button", { name: "Save Deck" }).click();
	await expect(
		page.locator(".notification", { hasText: "Saved Deck" }),
	).toHaveCount(1);

	// wait for notification to disappear
	await expect(
		page.locator(".notification", { hasText: "Saved Deck" }),
	).toHaveCount(0);

	// --- ADD THIRD CARD ---
	await page.getByRole("button", { name: "New Card" }).click();

	// --- FILL CARD 3 (Wally West) ---
	parent = page.locator(".input-container").filter({ has: frontLabel }).nth(2);
	await parent.getByRole("textbox").fill("Kid Flash");

	parent = page
		.locator(".input-container")
		.filter({ has: identityLabel })
		.nth(2);
	await parent.getByRole("textbox").fill("Wally West");

	parent = page.locator(".input-container").filter({ has: colorLabel }).nth(2);
	await parent.getByRole("textbox").fill("Yellow");

	// save deck and cards again
	await page.getByRole("button", { name: "Save Deck" }).click();
	await expect(
		page.locator(".notification", { hasText: "Saved Deck" }),
	).toHaveCount(1);

	// wait for notification to disappear
	await expect(
		page.locator(".notification", { hasText: "Saved Deck" }),
	).toHaveCount(0);

	// check that the deck name input has the correct initial value before editing
	await expect(page.getByLabel("Deck Name:")).toHaveValue("Speedsters");

	// edit the deck name
	await page.getByLabel("Deck Name:").fill("Speedsters of Central City");
	await page.getByRole("button", { name: "Save Deck" }).click();

	// navigate back to the dashboard to verify the name change
	await page.goto("/");
	await expect(page).toHaveURL("http://localhost:8080/");

	// check that the deck with the new name is visible on the dashboard
	const deckOnDashboard = page.getByText("Speedsters of Central City", {
		exact: true,
	});
	await expect(deckOnDashboard).toBeVisible();

	// check that the old name is not present
	await expect(page.getByText("Speedsters", { exact: true })).not.toBeVisible();

	// from the dashboard, click the deck name to navigate to the review page
	await deckOnDashboard.click();
	await expect(page).toHaveURL(/http:\/\/localhost:8080\/deck\/review\/[0-9]+/);

	// --- REVIEW FLOW ---
	const cardText = page.getByTestId("card-text");

	// Card 1: The Flash
	await expect(cardText).toHaveText("The Flash");
	await cardText.click();
	// Only check the first attribute for now
	await expect(cardText).toHaveText("Barry Allen");

	await page.locator(".next-button").click();

	// Card 2: Reverse-Flash
	await expect(cardText).toHaveText("Reverse-Flash");
	await cardText.click();
	// Only check the first attribute for now
	await expect(cardText).toHaveText("Eobard Thawne");

	await page.locator(".next-button").click();

	// Card 3: Kid Flash
	await expect(cardText).toHaveText("Kid Flash");
	await cardText.click();
	// Only check the first attribute for now
	await expect(cardText).toHaveText("Wally West");

	// Cycle back to start
	await page.locator(".next-button").click();

	await expect(cardText).toHaveText("The Flash");
});
