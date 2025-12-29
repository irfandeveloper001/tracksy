<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['student', 'driver', 'admin', 'manager', 'viewer'];
        
        foreach ($roles as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'api'],
                ['name' => $roleName, 'guard_name' => 'api']
            );
        }
        
        $this->command->info('✅ Roles seeded successfully');
    }
}

