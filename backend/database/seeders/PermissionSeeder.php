<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'buses.view',
            'buses.create',
            'buses.update',
            'buses.delete',
            'routes.view',
            'routes.create',
            'routes.update',
            'routes.delete',
            'students.view',
            'students.create',
            'students.update',
            'students.delete',
            'drivers.view',
            'drivers.create',
            'drivers.update',
            'drivers.delete',
            'bookings.view',
            'bookings.create',
            'bookings.update',
            'bookings.delete',
            'trips.view',
            'trips.create',
            'trips.update',
            'trips.delete',
            'analytics.view',
            'reports.generate',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'api'],
                ['name' => $permission, 'guard_name' => 'api']
            );
        }

        // Assign permissions to roles (only if roles exist)
        try {
            $admin = Role::findByName('admin', 'api');
            if ($admin) {
                $admin->syncPermissions(Permission::all());
            }
        } catch (\Exception $e) {
            $this->command->warn('Admin role not found, skipping permission assignment');
        }

        try {
            $manager = Role::findByName('manager', 'api');
            if ($manager) {
                $manager->syncPermissions([
                    'buses.view',
                    'routes.view',
                    'students.view',
                    'drivers.view',
                    'bookings.view',
                    'trips.view',
                    'analytics.view',
                ]);
            }
        } catch (\Exception $e) {
            $this->command->warn('Manager role not found, skipping permission assignment');
        }

        try {
            $viewer = Role::findByName('viewer', 'api');
            if ($viewer) {
                $viewer->syncPermissions([
                    'buses.view',
                    'routes.view',
                    'students.view',
                    'drivers.view',
                    'bookings.view',
                    'trips.view',
                    'analytics.view',
                ]);
            }
        } catch (\Exception $e) {
            $this->command->warn('Viewer role not found, skipping permission assignment');
        }

        $this->command->info('✅ Permissions seeded successfully');
    }
}

