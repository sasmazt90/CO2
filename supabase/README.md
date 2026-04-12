# Supabase Setup

This project ships a real social backend schema in:

- `supabase/migrations/20260413_create_social_backend.sql`

To apply it to the linked project:

1. Authenticate the CLI with a Supabase access token.
2. Link the project:
   - `npx supabase link --project-ref jbgzyvgiespdwllohgfl -p <db-password>`
3. Push the migration:
   - `npx supabase db push`

Required credentials that are still missing from the current workspace:

- Supabase access token for CLI auth
- Remote Postgres database password
