# MongoDB schema

Database: `MONGODB_DB` (default `sanjeev_portfolio`). Created/updated by `npm run db:migrate`.

## `contact_messages`
| field | type | notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | string (≤100) | |
| `email` | string (≤254) | stored lower-case |
| `subject` | string (≤150) | may be empty |
| `message` | string (≤5000) | |
| `status` | `"unread" \| "read" \| "archived"` | default `unread` |
| `createdAt`, `updatedAt` | date | |

Indexes: `{createdAt:-1}`, `{status:1, createdAt:-1}`.

## `admin_users`
`email` (unique, lower-case), `passwordHash` (bcrypt, cost 12 — never plaintext), `sessionVersion` (int; bump to sign every session out), `createdAt`, `updatedAt`.

## `rate_limits`
`_id` (hashed-IP key), `count`, `expiresAt` (TTL index, auto-cleaned). Used by the contact form, admin login and unlock endpoints.

Messages are only ever deleted by an authenticated admin who confirms in the UI.
