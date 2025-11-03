# Setting MySQL Password in .env

## Quick Fix

You need to add your MySQL password to the `.env` file.

### Option 1: Manual Edit
```bash
nano backend/.env
```

Find the line:
```
DB_PASSWORD=
```

And set it to your MySQL root password:
```
DB_PASSWORD=your_mysql_password_here
```

Save and exit (Ctrl+X, then Y, then Enter)

### Option 2: Using sed command
```bash
cd backend
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=your_mysql_password_here/' .env
```

Replace `your_mysql_password_here` with your actual MySQL password.

### Option 3: Using the helper script
```bash
cd backend
bash .env.password_helper.sh
```

This will prompt you for your password securely.

## After Setting Password

1. Test the connection:
```bash
php artisan migrate:status
```

2. If successful, run migrations:
```bash
php artisan migrate
```

3. Generate JWT secret:
```bash
php artisan jwt:secret --force
```

4. Publish packages:
```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
```

5. Run seeders:
```bash
php artisan db:seed
```

6. Create storage link:
```bash
php artisan storage:link
```

## Verify Password is Set

```bash
cd backend
grep "^DB_PASSWORD" .env
```

Should show:
```
DB_PASSWORD=your_password
```

⚠️ **Important:** Make sure the password matches the one you used when creating the database!

