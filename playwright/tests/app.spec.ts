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
	// The "Deck Editor" H1 is gone, but the deck title is visible in the sidebar
	await expect(page.locator(".deck-title")).toHaveText("Speedsters");

	// --- ADD ATTRIBUTES ---
	// In the new layout, we must open the settings panel first
	await page.locator('button[data-tooltip="Deck Settings"]').click();
	await expect(page.locator(".settings-panel")).toBeVisible();

	// Attribute 1: Secret Identity (This will be visible in Review)
	await page.getByPlaceholder("New attribute name").fill("Secret Identity");
	await page.getByRole("button", { name: "Add" }).click();

	// FIX: Wait for the first attribute to appear. This ensures the add operation finished
	// and the input field has been cleared by the app before we type the next one.
	await expect(page.locator(".tags")).toContainText("Secret Identity");

	// Attribute 2: Lightning Color (We save this, but don't check it in Review yet)
	await page.getByPlaceholder("New attribute name").fill("Lightning Color");
	await page.getByRole("button", { name: "Add" }).click();

	// Check that attributes are listed in the editor
	await expect(page.locator(".tags")).toContainText("Lightning Color");

	// Close settings to clear the view for the editor
	await page.locator(".close-btn").click();

	// --- ADD CARDS ---
	// Add two cards. Note: New layout auto-selects the *newest* card.
	await page.getByRole("button", { name: "New Card" }).click(); // Creates Card 1
	await page.getByRole("button", { name: "New Card" }).click(); // Creates Card 2

	// --- FILL CARD 1 (The Flash) ---
	// In the new layout, only one card is editable at a time.
	// We are currently on Card 2 (auto-selected). We must click Card 1 in the sidebar.
	await page.locator(".slide-thumbnail").first().click();

	// Helper labels are now used directly via getByLabel since the form is cleaner
	await page.getByLabel("Front Content").fill("The Flash");
	await page.getByLabel("Secret Identity").fill("Barry Allen");
	await page.getByLabel("Lightning Color").fill("Yellow");

	// --- FILL CARD 2 (Reverse-Flash) ---
	// Click the second thumbnail to edit Card 2
	await page.locator(".slide-thumbnail").nth(1).click();

	await page.getByLabel("Front Content").fill("Reverse-Flash");
	await page.getByLabel("Secret Identity").fill("Eobard Thawne");
	await page.getByLabel("Lightning Color").fill("Red");

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
	// Clicking this auto-selects the new 3rd card
	await page.getByRole("button", { name: "New Card" }).click();

	// --- FILL CARD 3 (Wally West) ---
	await page.getByLabel("Front Content").fill("Kid Flash");
	await page.getByLabel("Secret Identity").fill("Wally West");
	await page.getByLabel("Lightning Color").fill("Yellow");

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
	// Need to open settings again
	await page.locator('button[data-tooltip="Deck Settings"]').click();
	await expect(page.getByLabel("Deck Name")).toHaveValue("Speedsters");

	// edit the deck name
	await page.getByLabel("Deck Name").fill("Speedsters of Central City");
	// Close settings - the main "Save Deck" button handles the actual saving of the name
	await page.locator(".close-btn").click();
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
