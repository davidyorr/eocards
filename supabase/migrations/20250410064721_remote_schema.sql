alter table "public"."deck_attribute_type" drop constraint "deck_attribute_type_attribute_name_key";

alter table "public"."deck_attribute_type" drop constraint "deck_attribute_type_display_order_key";

drop index if exists "public"."deck_attribute_type_attribute_name_key";

drop index if exists "public"."deck_attribute_type_display_order_key";


