
- The CLI never connects to your database without explicit consent. Pass `--probe-db` to `npx prisma orm init` if you want `init` to verify the server version itself.


- **`contract.json`** — this tells your application what models exist, just like `package-lock.json` tells your package manager what dependencies your project has
- **`contract.d.ts`** — this powers autocomplete and type checking in your editor

Commit both files to git. When you change your contract, run `npx prisma contract emit` to update them.

## Configuration

[`prisma.config.ts`](prisma.config.ts) tells the CLI where your contract lives and how to connect to your database. It loads environment variables from `.env` automatically:

### Commands

```bash
npx prisma contract emit       # Update contract.json and contract.d.ts
npx prisma db init             # Create tables in the database
npx prisma migration status    # Show migration status
```

### Files

| File | Purpose |
|---|---|
| [`src/prisma/contract.prisma`](src/prisma/contract.prisma) | Your data contract — define your models here |
| [`prisma.config.ts`](prisma.config.ts) | CLI configuration |
| [`src/prisma/db.ts`](src/prisma/db.ts) | Database client — `import { db } from './src/prisma/db'` |
| `src/prisma/contract.json` | Compiled contract (generated) |
| `src/prisma/contract.d.ts` | Contract types (generated) |

### Workflow

1. Edit [`src/prisma/contract.prisma`](src/prisma/contract.prisma) to add or change models.
2. Run `npx prisma contract emit` to regenerate the contract.
3. Query your models — your IDE will autocomplete everything.

