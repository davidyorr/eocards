import { getSupabaseAdmin } from "@/utils/supabase";
import { test, expect } from "@playwright/test";

const USER_1_ID = crypto.randomUUID();

test.beforeAll(async () => {
	const supabaseAdmin = getSupabaseAdmin();

	await supabaseAdmin.auth.admin.createUser({
		id: USER_1_ID,
		email: `user1-${USER_1_ID}@test.com`,
		password: "password1234",
		email_confirm: true,
	});
});

test.afterAll(async () => {
	const supabaseAdmin = getSupabaseAdmin();

	await supabaseAdmin.auth.admin.deleteUser(USER_1_ID);
});

test("something", async ({ page }) => {
	await page.goto("http://localhost:8080/");

	await page.goto("http://localhost:8080/login");
	await page.getByPlaceholder("email").fill(`user1-${USER_1_ID}@test.com`);
	await page.getByPlaceholder("password").fill("password1234");
	await page.getByRole("button", { name: "Log In" }).click();

	await page.waitForURL("http://localhost:8080/");
	expect(page.getByRole("button", { name: "New Deck" })).toBeVisible();
});
