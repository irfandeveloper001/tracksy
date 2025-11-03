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
            Permission::create(['name' => $permission]);
        }

        // Assign permissions to roles
        $admin = Role::findByName('admin');
        $admin->givePermissionTo(Permission::all());

        $manager = Role::findByName('manager');
        $manager->givePermissionTo([
            'buses.view',
            'routes.view',
            'students.view',
            'drivers.view',
            'bookings.view',
            'trips.view',
            'analytics.view',
        ]);

        $viewer = Role::findByName('viewer');
        $viewer->givePermissionTo([
            'buses.view',
            'routes.view',
            'students.view',
            'drivers.view',
            'bookings.view',
            'trips.view',
            'analytics.view',
        ]);
    }
}

