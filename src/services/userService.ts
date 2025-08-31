import { supabase, User } from "./supabase";

export class UserService {
  static supabase = supabase;

  // 모든 사용자 가져오기
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  // 특정 사용자 가져오기
  static async getUser(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  // 이메일로 사용자 가져오기
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }

  // 기본 사용자 가져오기
  static async getDefaultUser(): Promise<User | null> {
    return this.getUserByEmail("kmk4604@gmail.com");
  }

  // 사용자 생성
  static async createUser(
    userData: Omit<User, "id" | "created_at" | "updated_at">
  ): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  // 사용자 업데이트
  static async updateUser(
    id: string,
    userData: Partial<User>
  ): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  // 사용자 삭제
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}
