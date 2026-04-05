import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://thbluogqjbdvjewaemyi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoYmx1b2dxamJkdmpld2FlbXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzc2NjAsImV4cCI6MjA5MDkxMzY2MH0.1JYYPw7jHnb6dmmx_8nMQKx2Mi2pa2Huq49mVeSDkOA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);