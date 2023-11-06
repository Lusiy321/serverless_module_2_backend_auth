import bcrypt from "bcrypt";
import { Pool } from "pg";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jubrjaocdbwatuwrzrbt.supabase.co";
const supabaseKey: any = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey) as SupabaseClient;

class User {
  constructor(public email: string, public password: string) {}
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class UserService {
  static async registerUser(email: string, password: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const insertUserQuery =
        "INSERT INTO users (email, password) VALUES ($1, $2)";
      await client.query(insertUserQuery, [email, hashedPassword]);
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async findUserByEmail(email: string): Promise<User | undefined> {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) {
      return undefined;
    }
    const { email: foundEmail, password } = result.rows[0];
    return new User(foundEmail, password);
  }

  static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
