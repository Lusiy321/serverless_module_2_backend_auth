import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = "https://jubrjaocdbwatuwrzrbt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YnJqYW9jZGJ3YXR1d3J6cmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg4NDQ3MTIsImV4cCI6MjAxNDQyMDcxMn0.3xGAseJOfdjyBJ1dgxq_bpwuLj-njwGOvijJ59MH6yY";

class User {
  constructor(public email: string, public password: string) {}
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class UserService {
  static async registerUser(email: string, password: string): Promise<any> {
    try {
      const id = uuidv4();
      const { error } = await supabase.from("users").insert({
        id,
        email,
        password,
      });
      if (error) {
        return { error: error.message };
      }
      if (!error) {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("email", email);
        if (error) {
          return { error: error.message };
        }
        return data;
      }
    } catch (error) {
      return console.error(error);
    }
  }

  static async findUserByEmail(email: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email);

      if (error) {
        return { error: error.message };
      }
      return data;
    } catch (error) {
      console.error(error);
      return { error: "User not found" };
    }
  }
  static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
