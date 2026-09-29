import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const target = (process.argv[2] || '').toLowerCase();
if (target !== 'supabase' && target !== 'postgres' && target !== 'postgresql' && target !== 'sqlite') {
  console.log(`Usage: tsx scripts/switch-db.ts [supabase|sqlite]`);
  process.exit(1);
}

const isPostgres = target === 'supabase' || target === 'postgres' || target === 'postgresql';
const newProvider = isPostgres ? 'postgresql' : 'sqlite';

const schemaPaths = [
  path.join(__dirname, '..', 'database', 'schema.prisma'),
  path.join(__dirname, '..', 'backend', 'prisma', 'schema.prisma'),
];

for (const p of schemaPaths) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    content = content.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, `provider = "${newProvider}"`);
    fs.writeFileSync(p, content, 'utf-8');
    console.log(`✅ Updated ${p} -> provider = "${newProvider}"`);
  }
}

try {
  console.log(`🔄 Generating Prisma Client for ${newProvider}...`);
  execSync('npx prisma generate --schema=database/schema.prisma', { stdio: 'inherit' });
  console.log(`🎉 Switched successfully to ${newProvider.toUpperCase()}!`);
  if (isPostgres) {
    console.log(`\n👉 Set your Supabase DATABASE_URL in your environment or Vercel Environment Variables:`);
    console.log(`DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"`);
    console.log(`Run 'npm run db:migrate' to create all tables in your Supabase database!\n`);
  } else {
    console.log(`\n👉 Local SQLite active: DATABASE_URL="file:./dev.db"\n`);
  }
} catch (err: any) {
  console.error('Error generating Prisma client:', err.message);
}
