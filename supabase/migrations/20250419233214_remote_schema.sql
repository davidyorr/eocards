create policy "Enable delete for users based on user_id"
on "public"."card"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = ( SELECT deck.user_id
   FROM deck deck
  WHERE (deck.id = card.deck_id))));


create policy "Enable delete for users based on user_id"
on "public"."card_attribute_value"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = ( SELECT deck.user_id
   FROM (deck_attribute_type
     JOIN deck ON ((deck_attribute_type.deck_id = deck.id)))
  WHERE (deck_attribute_type.id = card_attribute_value.deck_attribute_type_id))));


create policy "Enable delete for users based on user_id"
on "public"."deck_attribute_type"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = ( SELECT deck.user_id
   FROM deck deck
  WHERE (deck.id = deck_attribute_type.deck_id))));


create policy "Enable update for users based on user_id"
on "public"."deck_attribute_type"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = ( SELECT deck.user_id
   FROM deck deck
  WHERE (deck.id = deck_attribute_type.deck_id))))
with check ((( SELECT auth.uid() AS uid) = ( SELECT deck.user_id
   FROM deck deck
  WHERE (deck.id = deck_attribute_type.deck_id))));


create policy "Enable update for users based on user_id"
on "public"."user"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



