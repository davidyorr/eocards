alter table "public"."card" drop constraint "card_deck_id_fkey";

alter table "public"."card_attribute_value" drop constraint "card_attribute_value_deck_attribute_type_id_fkey";

alter table "public"."deck_attribute_type" drop constraint "deck_attribute_type_deck_id_fkey";

alter table "public"."card" add constraint "card_deck_id_fkey" FOREIGN KEY (deck_id) REFERENCES deck(id) ON DELETE CASCADE not valid;

alter table "public"."card" validate constraint "card_deck_id_fkey";

alter table "public"."card_attribute_value" add constraint "card_attribute_value_deck_attribute_type_id_fkey" FOREIGN KEY (deck_attribute_type_id) REFERENCES deck_attribute_type(id) ON DELETE CASCADE not valid;

alter table "public"."card_attribute_value" validate constraint "card_attribute_value_deck_attribute_type_id_fkey";

alter table "public"."deck_attribute_type" add constraint "deck_attribute_type_deck_id_fkey" FOREIGN KEY (deck_id) REFERENCES deck(id) ON DELETE CASCADE not valid;

alter table "public"."deck_attribute_type" validate constraint "deck_attribute_type_deck_id_fkey";


