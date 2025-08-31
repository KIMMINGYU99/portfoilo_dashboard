import { supabase, CareerTimeline } from "./supabase";

export class CareerService {
  static async listByUser(userId: string): Promise<CareerTimeline[]> {
    const { data, error } = await supabase
      .from("career_timeline")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: true });
    if (error) throw error;
    return (data || []) as unknown as CareerTimeline[];
  }

  static async create(item: Omit<CareerTimeline, "id" | "created_at">): Promise<CareerTimeline | null> {
    const { data, error } = await supabase
      .from("career_timeline")
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data as unknown as CareerTimeline;
  }

  static async update(id: string, item: Partial<CareerTimeline>): Promise<CareerTimeline | null> {
    const { data, error } = await supabase
      .from("career_timeline")
      .update(item)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as CareerTimeline;
  }

  static async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from("career_timeline").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
}
