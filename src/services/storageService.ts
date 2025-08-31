import { supabase } from "./supabase";

export class StorageService {
  static async uploadPublic(
    bucket: string,
    file: File,
    pathPrefix: string = "uploads"
  ): Promise<string | null> {
    const fileName = `${pathPrefix}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return pub?.publicUrl || null;
  }

  static async uploadManyPublic(
    bucket: string,
    files: File[],
    pathPrefix: string = "uploads"
  ): Promise<string[]> {
    const results: string[] = [];
    for (const file of files) {
      const url = await StorageService.uploadPublic(bucket, file, pathPrefix);
      if (url) results.push(url);
    }
    return results;
  }

  static async deletePublicUrl(url: string): Promise<boolean> {
    try {
      // Expecting: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const marker = "/storage/v1/object/public/";
      const idx = url.indexOf(marker);
      if (idx === -1) return false;
      const after = url.substring(idx + marker.length);
      const firstSlash = after.indexOf("/");
      if (firstSlash === -1) return false;
      const bucket = after.substring(0, firstSlash);
      const path = after.substring(firstSlash + 1);
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) {
        console.error("Storage delete error:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Storage delete exception:", e);
      return false;
    }
  }
}
