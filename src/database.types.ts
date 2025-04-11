export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			card: {
				Row: {
					created_at: string;
					deck_id: number;
					display_order: number;
					front_content: string;
					id: number;
					notes: string | null;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					deck_id: number;
					display_order: number;
					front_content: string;
					id?: number;
					notes?: string | null;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					deck_id?: number;
					display_order?: number;
					front_content?: string;
					id?: number;
					notes?: string | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "card_deck_id_fkey";
						columns: ["deck_id"];
						isOneToOne: false;
						referencedRelation: "deck";
						referencedColumns: ["id"];
					},
				];
			};
			card_attribute_value: {
				Row: {
					card_id: number;
					created_at: string;
					deck_attribute_type_id: number;
					id: number;
					value: string;
				};
				Insert: {
					card_id: number;
					created_at?: string;
					deck_attribute_type_id: number;
					id?: number;
					value: string;
				};
				Update: {
					card_id?: number;
					created_at?: string;
					deck_attribute_type_id?: number;
					id?: number;
					value?: string;
				};
				Relationships: [
					{
						foreignKeyName: "card_attribute_value_card_id_fkey";
						columns: ["card_id"];
						isOneToOne: false;
						referencedRelation: "card";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "card_attribute_value_deck_attribute_type_id_fkey";
						columns: ["deck_attribute_type_id"];
						isOneToOne: false;
						referencedRelation: "deck_attribute_type";
						referencedColumns: ["id"];
					},
				];
			};
			deck: {
				Row: {
					created_at: string;
					id: number;
					name: string;
					updated_at: string;
					user_id: string | null;
				};
				Insert: {
					created_at?: string;
					id?: number;
					name: string;
					updated_at?: string;
					user_id?: string | null;
				};
				Update: {
					created_at?: string;
					id?: number;
					name?: string;
					updated_at?: string;
					user_id?: string | null;
				};
				Relationships: [];
			};
			deck_attribute_type: {
				Row: {
					attribute_name: string;
					attribute_type: Database["public"]["Enums"]["attribute_type"];
					deck_id: number;
					display_order: number;
					id: number;
				};
				Insert: {
					attribute_name: string;
					attribute_type?: Database["public"]["Enums"]["attribute_type"];
					deck_id: number;
					display_order: number;
					id?: number;
				};
				Update: {
					attribute_name?: string;
					attribute_type?: Database["public"]["Enums"]["attribute_type"];
					deck_id?: number;
					display_order?: number;
					id?: number;
				};
				Relationships: [
					{
						foreignKeyName: "deck_attribute_type_deck_id_fkey";
						columns: ["deck_id"];
						isOneToOne: false;
						referencedRelation: "deck";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			attribute_type: "text" | "image";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			attribute_type: ["text", "image"],
		},
	},
} as const;
