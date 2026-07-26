import { createClient, type User } from "@supabase/supabase-js";

type DemoRole = "STUDENT" | "TEACHER" | "STAFF" | "ADMIN";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value;
};

const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const secretKey = required("SUPABASE_SERVICE_ROLE_KEY");
const password = required("DEMO_USER_PASSWORD");

if (password.length < 12) {
  throw new Error("DEMO_USER_PASSWORD deve possuir ao menos 12 caracteres.");
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts: Array<{
  role: DemoRole;
  email: string;
  fullName: string;
  username: string;
}> = [
  {
    role: "STUDENT",
    email: process.env.DEMO_STUDENT_EMAIL || "student.demo@example.com",
    fullName: "Estudante Demonstração",
    username: "demo.student",
  },
  {
    role: "TEACHER",
    email: process.env.DEMO_TEACHER_EMAIL || "teacher.demo@example.com",
    fullName: "Professor Demonstração",
    username: "demo.teacher",
  },
  {
    role: "STAFF",
    email: process.env.DEMO_STAFF_EMAIL || "staff.demo@example.com",
    fullName: "Equipe Demonstração",
    username: "demo.staff",
  },
  {
    role: "ADMIN",
    email: process.env.DEMO_ADMIN_EMAIL || "admin.demo@example.com",
    fullName: "Administrador Demonstração",
    username: "demo.admin",
  },
];

async function findUserByEmail(email: string): Promise<User | null> {
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw error;
    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < 100) return null;
  }
}

async function ensureAuthUser(account: (typeof accounts)[number]) {
  const existing = await findUserByEmail(account.email);
  if (existing) return existing;
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: account.fullName },
  });
  if (error || !data.user)
    throw error ?? new Error(`Falha ao criar ${account.role}`);
  return data.user;
}

async function main() {
  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("id")
    .eq("active", true)
    .order("name")
    .limit(1)
    .single();
  if (courseError || !course)
    throw new Error("Nenhum curso ativo encontrado. Execute o seed primeiro.");

  for (const account of accounts) {
    const user = await ensureAuthUser(account);
    const { error } = await admin.from("profiles").upsert(
      {
        id: user.id,
        full_name: account.fullName,
        username: account.username,
        course_id: course.id,
        role: account.role,
        onboarding_completed: true,
        terms_accepted_at: new Date().toISOString(),
        suspended_at: null,
      },
      { onConflict: "id" },
    );
    if (error)
      throw new Error(`Falha ao preparar ${account.role}: ${error.message}`);
    process.stdout.write(`✓ ${account.role}: ${account.email}\n`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  process.stderr.write(`Falha ao criar usuários de demonstração: ${message}\n`);
  process.exitCode = 1;
});
