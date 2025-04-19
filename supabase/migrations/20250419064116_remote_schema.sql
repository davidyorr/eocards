drop policy "Enable insert for authenticated users only" on "public"."deck";

alter table "public"."user" drop constraint "check_preferences";

alter table "public"."user" add constraint "check_preferences" CHECK (jsonb_matches_schema('{
        "type": "object",
        "properties": {
            "dark_mode": {
                "type": "boolean"
            }
        }
    }'::json, preferences)) not valid;

alter table "public"."user" validate constraint "check_preferences";

create policy "Enable insert for users based on user_id"
on "public"."deck"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable delete for users based on user_id"
on "public"."user"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for users based on user_id"
on "public"."user"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."user"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



