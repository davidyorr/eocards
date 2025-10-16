alter table "public"."card_attribute_value" drop constraint "card_attribute_value_card_id_fkey";

alter table "public"."card_attribute_value" add constraint "card_attribute_value_card_id_fkey" FOREIGN KEY (card_id) REFERENCES card(id) ON DELETE CASCADE not valid;

alter table "public"."card_attribute_value" validate constraint "card_attribute_value_card_id_fkey";


