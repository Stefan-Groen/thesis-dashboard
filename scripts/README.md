# User Management Scripts

These scripts help you manage users in your Article Classifier dashboard.

## Prerequisites

Make sure you have:
- Node.js installed
- `.env.local` file configured with `DATABASE_URL`
- `tsx` package installed (should be in your devDependencies)

## Creating a New User

To create a new user, run:

```bash
pnpm tsx scripts/create-user.ts
```

The script will prompt you for:
- **Username** (required) - Only letters, numbers, dots, and underscores
- **Password** (required) - Minimum 8 characters
- **Full Name** (optional)
- **Email** (optional)

### Example Session:

```
🔐 User Creation Script
========================

Enter username: john
Enter password: mypassword123
Enter full name (optional): John Doe
Enter email (optional): john@example.com

🔒 Hashing password...
💾 Saving user to database...

✅ User created successfully!

User Details:
─────────────
ID:         5
Username:   john
Full Name:  John Doe
Email:      john@example.com
Created:    2025-11-13T...

🎉 You can now use these credentials to log in!
```

## Deleting a User

To delete a user, run:

```bash
pnpm tsx scripts/delete-user.ts
```

The script will:
1. Show you all existing users
2. Ask which user to delete
3. Show user details
4. Ask for final confirmation (type "DELETE")

### Example Session:

```
🗑️  User Deletion Script
========================

📋 Existing users:
─────────────────────────────────────────────────────────────
ID: 1 | Username: admin | Status: ✅ Active | Last Login: 11/13/2025
   Name: Admin User
   Email: admin@example.com
─────────────────────────────────────────────────────────────
ID: 2 | Username: john | Status: ✅ Active | Last Login: Never
   Name: John Doe
   Email: john@example.com
─────────────────────────────────────────────────────────────

⚠️  WARNING: This action cannot be undone!

Enter username to delete (or "cancel" to abort): john

📝 User to be deleted:
─────────────────────
ID:         2
Username:   john
Full Name:  John Doe
Email:      john@example.com
─────────────────────

Type "DELETE" to confirm deletion: DELETE

🗑️  Deleting user...

✅ User 'john' has been deleted successfully!
```

## Security Notes

- **Passwords** are hashed using bcrypt with 10 salt rounds
- **Never commit** passwords or user credentials to git
- The delete script requires typing "DELETE" to confirm (prevents accidents)
- Users with associated data may require data cleanup before deletion

## Troubleshooting

### "Error: User already exists"
- The username is already taken
- Choose a different username

### "Error: Password must be at least 8 characters"
- Use a stronger password with at least 8 characters

### "Foreign key constraint error" (when deleting)
- The user has associated data (uploaded articles, etc.)
- You may need to delete their articles first, or update them to a different user

### "DATABASE_URL environment variable is not set"
- Make sure your `.env.local` file exists
- Check that `DATABASE_URL` is correctly set in the file
- Verify you're running the script from the project root directory

## Additional Information

The scripts use:
- `bcrypt` for password hashing
- `pg` for PostgreSQL database connections
- `readline` for interactive prompts
- `dotenv` for environment variables

For more information about the database schema, see the main project documentation.
