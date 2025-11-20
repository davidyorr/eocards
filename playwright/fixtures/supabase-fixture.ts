import { getSupabaseAdmin } from "@/utils/supabase";
import { test as base } from "@playwright/test";
import { Database } from "@/database.types";

type TestUser = {
	id: string;
	email: string;
	password: string;
};

type TableName = keyof Database["public"]["Tables"];

const createdUsers: TestUser[] = [];

export const test = base.extend<{
	createUser: (options?: Partial<TestUser>) => Promise<TestUser>;
	cleanupUsers: void;
	logOnFailure: void;
}>({
	createUser: async ({}, use) => {
		await use(async (options?: Partial<TestUser>): Promise<TestUser> => {
			const supabaseAdmin = getSupabaseAdmin();

			const id = options?.id || crypto.randomUUID();
			const email = options?.email || `user-${id}@test.com`;
			const password = options?.password || `password${createdUsers.length}`;

			await supabaseAdmin.auth.admin.createUser({
				id,
				email,
				password,
				email_confirm: true,
			});

			const user: TestUser = {
				id,
				email,
				password,
			};

			createdUsers.push({ id, email, password });
			return user;
		});
	},

	cleanupUsers: [
		async ({}, use) => {
			await use();

			if (createdUsers.length > 0) {
				const supabaseAdmin = getSupabaseAdmin();

				for await (const user of createdUsers) {
					try {
						await supabaseAdmin.auth.admin.deleteUser(user.id);
					} catch (error) {
						console.error(`Failed to delete user ${user.id}:`, error);
					}
				}

				createdUsers.length = 0;
			}
		},
		{ auto: true },
	],

	logOnFailure: [
		async ({}, use, testInfo) => {
			await use();

			if (testInfo.status !== testInfo.expectedStatus) {
				console.log("--- DATABASE STATE ---");

				const supabaseAdmin = getSupabaseAdmin();
				const tableNames: Array<TableName> = [
					"deck",
					"card",
					"deck_attribute_type",
					"card_attribute_value",
					"user",
				] as const;

				for (const table of tableNames) {
					const { data, error } = await supabaseAdmin.from(table).select("*");

					console.log(`\n--- Table: ${table} ---`);
					if (error) {
						console.error(`Error fetching data for ${table}:`, error.message);
					} else if (data && data.length > 0) {
						console.table(data);
					} else {
						console.log("[] (No data found)");
					}
				}
				console.log("\n--- END OF DATABASE STATE ---");
			}
		},
		{ auto: true },
	],
});

export { expect } from "@playwright/test";
