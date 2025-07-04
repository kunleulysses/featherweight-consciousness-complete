import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { db } from './db';
import { sql } from 'drizzle-orm';

interface Migration {
  version: string;
  filename: string;
  description: string;
  content: string;
}

export class MigrationRunner {
  private migrationsDir: string;

  constructor(migrationsDir = join(process.cwd(), 'migrations')) {
    this.migrationsDir = migrationsDir;
  }

  private async ensureMigrationTable(): Promise<void> {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        description TEXT,
        applied_at TIMESTAMP DEFAULT NOW() NOT NULL,
        checksum VARCHAR(64) NOT NULL
      )
    `);
  }

  private async getAppliedMigrations(): Promise<Set<string>> {
    const result = await db.execute(sql`
      SELECT version FROM schema_migrations ORDER BY version
    `);
    
    return new Set(result.rows.map(row => (row as any).version));
  }

  private async loadMigrations(): Promise<Migration[]> {
    const files = await readdir(this.migrationsDir);
    const migrationFiles = files
      .filter(file => file.match(/^V\d+__.*\.sql$/))
      .sort();

    const migrations: Migration[] = [];

    for (const filename of migrationFiles) {
      const match = filename.match(/^V(\d+)__(.*)\.sql$/);
      if (!match) continue;

      const [, version, description] = match;
      const content = await readFile(join(this.migrationsDir, filename), 'utf-8');

      migrations.push({
        version: version.padStart(3, '0'),
        filename,
        description: description.replace(/_/g, ' '),
        content,
      });
    }

    return migrations;
  }

  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async applyMigration(migration: Migration): Promise<void> {
    const checksum = this.calculateChecksum(migration.content);

    try {
      // Start transaction
      await db.execute(sql`BEGIN`);

      // Execute migration
      console.log(`📦 Applying migration ${migration.version}: ${migration.description}`);
      
      // Split content by semicolons and execute each statement
      const statements = migration.content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await db.execute(sql.raw(statement));
        }
      }

      // Record migration
      await db.execute(sql`
        INSERT INTO schema_migrations (version, filename, description, checksum)
        VALUES (${migration.version}, ${migration.filename}, ${migration.description}, ${checksum})
      `);

      // Commit transaction
      await db.execute(sql`COMMIT`);
      
      console.log(`✅ Successfully applied migration ${migration.version}`);
    } catch (error) {
      // Rollback transaction
      await db.execute(sql`ROLLBACK`);
      throw new Error(`Failed to apply migration ${migration.version}: ${error}`);
    }
  }

  async runMigrations(): Promise<void> {
    console.log('🚀 Starting database migrations...');

    try {
      // Ensure migration table exists
      await this.ensureMigrationTable();

      // Load available migrations
      const migrations = await this.loadMigrations();
      const appliedMigrations = await this.getAppliedMigrations();

      // Filter out already applied migrations
      const pendingMigrations = migrations.filter(
        migration => !appliedMigrations.has(migration.version)
      );

      if (pendingMigrations.length === 0) {
        console.log('✨ No pending migrations found. Database is up to date!');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
      for (const migration of pendingMigrations) {
        console.log(`   - ${migration.version}: ${migration.description}`);
      }

      // Apply pending migrations
      for (const migration of pendingMigrations) {
        await this.applyMigration(migration);
      }

      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('💥 Migration failed:', error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<void> {
    await this.ensureMigrationTable();
    
    const migrations = await this.loadMigrations();
    const appliedMigrations = await this.getAppliedMigrations();

    console.log('\n📊 Migration Status:');
    console.log('='.repeat(60));

    for (const migration of migrations) {
      const status = appliedMigrations.has(migration.version) ? '✅ Applied' : '⏳ Pending';
      console.log(`${status} | ${migration.version} | ${migration.description}`);
    }

    const pendingCount = migrations.filter(m => !appliedMigrations.has(m.version)).length;
    console.log('='.repeat(60));
    console.log(`Total: ${migrations.length} migrations | Pending: ${pendingCount}`);
  }

  async rollbackLastMigration(): Promise<void> {
    console.log('⚠️  Rolling back last migration...');
    
    const result = await db.execute(sql`
      SELECT version, filename, description 
      FROM schema_migrations 
      ORDER BY applied_at DESC 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('❌ No migrations to rollback');
      return;
    }

    const lastMigration = result.rows[0] as any;
    
    console.log(`🔄 Rolling back migration ${lastMigration.version}: ${lastMigration.description}`);
    console.log('⚠️  WARNING: This is a destructive operation!');
    
    // In a real implementation, you would need rollback scripts
    // For now, just remove the migration record
    await db.execute(sql`
      DELETE FROM schema_migrations 
      WHERE version = ${lastMigration.version}
    `);
    
    console.log(`✅ Rollback completed for migration ${lastMigration.version}`);
    console.log('⚠️  Note: Data changes were NOT automatically reversed. Manual cleanup may be required.');
  }
}

// CLI usage
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'run':
          await runner.runMigrations();
          break;
        case 'status':
          await runner.getMigrationStatus();
          break;
        case 'rollback':
          await runner.rollbackLastMigration();
          break;
        default:
          console.log('Usage: npm run migrate [run|status|rollback]');
          process.exit(1);
      }
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  })();
}
