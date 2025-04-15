import { getSupabaseAdmin } from "@/utils/supabase";
import { test as base } from "@playwright/test";

type TestUser = {
	id: string;
	email: string;
	password: string;
};

const createdUsers: TestUser[] = [];

export const test = base.extend<{
	createUser: (options?: Partial<TestUser>) => Promise<TestUser>;
	cleanupUsers: void;
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
						// the data must be deleted in a certain order to avoid "foreign key constraint" errors

						// delete deck attribute types
						const decks = await supabaseAdmin
							.from("deck")
							.select()
							.eq("user_id", user.id);
						for await (const deck of decks.data ?? []) {
							await supabaseAdmin
								.from("deck_attribute_type")
								.delete()
								.eq("deck_id", deck.id);

							// delete card attribute values
							const cards = await supabaseAdmin
								.from("card")
								.select()
								.eq("deck_id", deck.id);
							cards.data?.forEach(async (card) => {
								await supabaseAdmin
									.from("card_attribute_value")
									.delete()
									.eq("card_id", card.id);
							});

							// delete cards
							await supabaseAdmin.from("card").delete().eq("deck_id", deck.id);
						}

						// delete decks
						await supabaseAdmin.from("deck").delete().eq("user_id", user.id);

						// delete user
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
});

export { expect } from "@playwright/test";
