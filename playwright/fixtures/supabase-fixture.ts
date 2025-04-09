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

				for (const user of createdUsers) {
					try {
						// delete decks
						const deletedDecks = await supabaseAdmin
							.from("deck")
							.delete()
							.eq("user_id", user.id)
							.select();
						console.log("deleted decks", deletedDecks);
						deletedDecks.data?.forEach(async (deck) => {
							// delete deck attribute types
							await supabaseAdmin
								.from("deck_attribute_type")
								.delete()
								.eq("deck_id", deck.id);

							// delete cards
							const deletedCards = await supabaseAdmin
								.from("card")
								.delete()
								.eq("deck_id", deck.id)
								.select();

							// delete card attributes values
							deletedCards.data?.forEach(async (card) => {
								await supabaseAdmin
									.from("card_attribute_value")
									.delete()
									.eq("card_id", card.id);
							});
						});
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
