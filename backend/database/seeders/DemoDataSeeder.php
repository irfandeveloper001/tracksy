<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use App\Models\User;
use App\Models\Route;
use App\Models\Stop;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Fee;
use App\Models\Payment;
use App\Models\Notification;
use App\Models\Setting;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->warn('Skipping demo data seeding in production.');
            return;
        }

        $this->seedSettings();
        $admins = $this->seedAdmins();
        $routes = $this->seedRoutes();
        $stops = $this->seedStops();
        $this->attachStopsToRoutes($routes, $stops);
        $drivers = $this->seedDrivers();
        $students = $this->seedStudents($routes);
        $buses = $this->seedBuses($routes, $drivers);
        $this->assignDriversToBuses($drivers, $buses);
        $trips = $this->seedTrips($buses, $drivers, $routes);
        $this->seedLocations($buses, $drivers);
        $this->seedBookings($students, $buses, $trips);
        $this->seedFeesAndPayments($students);
        $this->seedNotifications($students, $drivers, $buses, $routes);
        $this->seedAdminNotifications($admins, $students, $buses);

        $this->command->info('✅ Demo data seeded successfully.');
    }

    private function seedSettings(): void
    {
        $settings = [
            ['key' => 'app_name', 'category' => 'system', 'value' => 'Tracksy'],
            ['key' => 'app_logo', 'category' => 'system', 'value' => ''],
            ['key' => 'timezone', 'category' => 'system', 'value' => 'Asia/Karachi'],
            ['key' => 'date_format', 'category' => 'system', 'value' => 'YYYY-MM-DD'],
            ['key' => 'time_format', 'category' => 'system', 'value' => 'HH:mm'],
            ['key' => 'language', 'category' => 'system', 'value' => 'en'],
            ['key' => 'require_fee_clearance', 'category' => 'system', 'value' => '1'],
            ['key' => 'map_provider', 'category' => 'map', 'value' => 'openstreetmap'],
            ['key' => 'default_zoom', 'category' => 'map', 'value' => '12'],
            ['key' => 'email_enabled', 'category' => 'notifications', 'value' => '1'],
            ['key' => 'push_enabled', 'category' => 'notifications', 'value' => '1'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key'], 'category' => $setting['category']],
                ['value' => $setting['value']]
            );
        }
    }

    private function seedRoutes(): array
    {
        $routesData = [
            [
                'name' => 'Lahore City Campus Loop',
                'start_point' => 'Gulberg, Lahore, Punjab',
                'end_point' => 'Superior University, Lahore',
                'distance' => 12.4,
                'estimated_duration' => 35,
                'is_active' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Islamabad Tech Corridor',
                'start_point' => 'G-9 Markaz, Islamabad',
                'end_point' => 'NUST H-12, Islamabad',
                'distance' => 18.7,
                'estimated_duration' => 45,
                'is_active' => true,
                'status' => 'active',
            ],
            [
                'name' => 'Rawalpindi University Shuttle',
                'start_point' => 'Saddar, Rawalpindi',
                'end_point' => 'COMSATS University Islamabad',
                'distance' => 22.3,
                'estimated_duration' => 55,
                'is_active' => true,
                'status' => 'active',
            ],
        ];

        $routes = [];
        foreach ($routesData as $data) {
            $routes[] = Route::updateOrCreate(['name' => $data['name']], $data);
        }

        return $routes;
    }

    private function seedAdmins(): array
    {
        $adminsData = [
            [
                'name' => 'Irfan Shakil',
                'email' => 'irfan.shakil@tracksy.pk',
                'phone' => '+92 300 5552233',
                'role' => 'admin',
            ],
            [
                'name' => 'Sana Noor',
                'email' => 'sana.noor@tracksy.pk',
                'phone' => '+92 301 8801222',
                'role' => 'manager',
            ],
        ];

        $admins = [];
        foreach ($adminsData as $data) {
            $admin = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'role' => $data['role'],
                    'status' => 'active',
                    'password' => Hash::make('Admin123!'),
                ]
            );
            $admin->assignRole($data['role']);
            $admins[] = $admin;
        }

        return $admins;
    }

    private function seedStops(): array
    {
        $stopsData = [
            [
                'name' => 'Liberty Market',
                'address' => 'Liberty Roundabout, Gulberg, Lahore',
                'latitude' => 31.5100,
                'longitude' => 74.3530,
            ],
            [
                'name' => 'Johar Town Gate',
                'address' => 'Johar Town, Lahore',
                'latitude' => 31.4667,
                'longitude' => 74.2654,
            ],
            [
                'name' => 'UET Lahore Gate',
                'address' => 'University of Engineering & Technology, Lahore',
                'latitude' => 31.5797,
                'longitude' => 74.3566,
            ],
            [
                'name' => 'F-8 Markaz',
                'address' => 'F-8 Markaz, Islamabad',
                'latitude' => 33.7083,
                'longitude' => 73.0498,
            ],
            [
                'name' => 'G-11 Signal',
                'address' => 'G-11 Markaz, Islamabad',
                'latitude' => 33.6692,
                'longitude' => 73.0106,
            ],
            [
                'name' => 'Blue Area',
                'address' => 'Blue Area, Islamabad',
                'latitude' => 33.7203,
                'longitude' => 73.0600,
            ],
            [
                'name' => 'Committee Chowk',
                'address' => 'Committee Chowk, Rawalpindi',
                'latitude' => 33.6414,
                'longitude' => 73.0747,
            ],
            [
                'name' => 'Satellite Town',
                'address' => 'Satellite Town, Rawalpindi',
                'latitude' => 33.6261,
                'longitude' => 73.0725,
            ],
            [
                'name' => 'Ghauri Town',
                'address' => 'Ghauri Town, Islamabad',
                'latitude' => 33.6350,
                'longitude' => 73.1760,
            ],
        ];

        $stops = [];
        foreach ($stopsData as $data) {
            $stops[] = Stop::updateOrCreate(['name' => $data['name']], $data);
        }

        return $stops;
    }

    private function attachStopsToRoutes(array $routes, array $stops): void
    {
        $routeStops = [
            'Lahore City Campus Loop' => [
                ['stop' => 'Liberty Market', 'order' => 1, 'estimated_time' => 8],
                ['stop' => 'Johar Town Gate', 'order' => 2, 'estimated_time' => 12],
                ['stop' => 'UET Lahore Gate', 'order' => 3, 'estimated_time' => 15],
            ],
            'Islamabad Tech Corridor' => [
                ['stop' => 'F-8 Markaz', 'order' => 1, 'estimated_time' => 10],
                ['stop' => 'G-11 Signal', 'order' => 2, 'estimated_time' => 12],
                ['stop' => 'Blue Area', 'order' => 3, 'estimated_time' => 14],
            ],
            'Rawalpindi University Shuttle' => [
                ['stop' => 'Committee Chowk', 'order' => 1, 'estimated_time' => 9],
                ['stop' => 'Satellite Town', 'order' => 2, 'estimated_time' => 11],
                ['stop' => 'Ghauri Town', 'order' => 3, 'estimated_time' => 18],
            ],
        ];

        foreach ($routes as $route) {
            $stopsForRoute = $routeStops[$route->name] ?? [];
            $syncData = [];
            foreach ($stopsForRoute as $stopInfo) {
                $stop = collect($stops)->firstWhere('name', $stopInfo['stop']);
                if ($stop) {
                    $syncData[$stop->id] = [
                        'order' => $stopInfo['order'],
                        'estimated_time' => $stopInfo['estimated_time'],
                    ];
                }
            }
            if (!empty($syncData)) {
                $route->stops()->syncWithoutDetaching($syncData);
            }
        }
    }

    private function seedDrivers(): array
    {
        $driversData = [
            [
                'name' => 'Ayesha Kanwal',
                'email' => 'ayesha.kanwal@tracksy.pk',
                'driver_id' => 'DRV-12345',
                'phone' => '+92 300 1234567',
                'license_number' => 'LIC-PK-34911',
                'status' => 'active',
            ],
            [
                'name' => 'Bilal Akram',
                'email' => 'bilal.akram@tracksy.pk',
                'driver_id' => 'DRV-33441',
                'phone' => '+92 301 7755123',
                'license_number' => 'LIC-PK-90214',
                'status' => 'active',
            ],
            [
                'name' => 'Usman Raza',
                'email' => 'usman.raza@tracksy.pk',
                'driver_id' => 'DRV-55670',
                'phone' => '+92 333 6509801',
                'license_number' => 'LIC-PK-77420',
                'status' => 'on_leave',
            ],
        ];

        $drivers = [];
        foreach ($driversData as $data) {
            $driver = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'driver_id' => $data['driver_id'],
                    'phone' => $data['phone'],
                    'license_number' => $data['license_number'],
                    'role' => 'driver',
                    'status' => $data['status'],
                    'password' => Hash::make('Driver123!'),
                ]
            );
            $driver->assignRole('driver');
            $drivers[] = $driver;
        }

        return $drivers;
    }

    private function seedStudents(array $routes): array
    {
        $studentsData = [
            [
                'name' => 'Maaz Ahmed',
                'email' => 'maaz.ahmed@students.superior.edu.pk',
                'student_id' => 'STU-1001',
                'institution' => 'Superior University',
                'phone' => '+92 331 2214501',
                'status' => 'active',
                'route' => 'Lahore City Campus Loop',
            ],
            [
                'name' => 'Arslan Gohar',
                'email' => 'arslan.gohar@students.uet.edu.pk',
                'student_id' => 'STU-1002',
                'institution' => 'UET Lahore',
                'phone' => '+92 332 3345577',
                'status' => 'active',
                'route' => 'Lahore City Campus Loop',
            ],
            [
                'name' => 'Abdul Muqeet',
                'email' => 'abdul.muqeet@students.uet.edu.pk',
                'student_id' => 'STU-1003',
                'institution' => 'UET Lahore',
                'phone' => '+92 333 4088891',
                'status' => 'active',
                'route' => 'Lahore City Campus Loop',
            ],
            [
                'name' => 'Hira Fatima',
                'email' => 'hira.fatima@students.nust.edu.pk',
                'student_id' => 'STU-2001',
                'institution' => 'NUST',
                'phone' => '+92 300 9881133',
                'status' => 'active',
                'route' => 'Islamabad Tech Corridor',
            ],
            [
                'name' => 'Sana Iqbal',
                'email' => 'sana.iqbal@students.nust.edu.pk',
                'student_id' => 'STU-2002',
                'institution' => 'NUST',
                'phone' => '+92 300 7764411',
                'status' => 'active',
                'route' => 'Islamabad Tech Corridor',
            ],
            [
                'name' => 'Adeel Khan',
                'email' => 'adeel.khan@students.comsats.edu.pk',
                'student_id' => 'STU-3001',
                'institution' => 'COMSATS University',
                'phone' => '+92 335 8899011',
                'status' => 'inactive',
                'route' => 'Rawalpindi University Shuttle',
            ],
            [
                'name' => 'Areeba Malik',
                'email' => 'areeba.malik@students.comsats.edu.pk',
                'student_id' => 'STU-3002',
                'institution' => 'COMSATS University',
                'phone' => '+92 336 7701234',
                'status' => 'active',
                'route' => 'Rawalpindi University Shuttle',
            ],
            [
                'name' => 'Hamza Tariq',
                'email' => 'hamza.tariq@students.comsats.edu.pk',
                'student_id' => 'STU-3003',
                'institution' => 'COMSATS University',
                'phone' => '+92 343 5500198',
                'status' => 'active',
                'route' => 'Rawalpindi University Shuttle',
            ],
        ];

        $students = [];
        foreach ($studentsData as $data) {
            $route = collect($routes)->firstWhere('name', $data['route']);
            $student = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'student_id' => $data['student_id'],
                    'institution' => $data['institution'],
                    'phone' => $data['phone'],
                    'role' => 'student',
                    'status' => $data['status'],
                    'assigned_route_id' => $route?->id,
                    'password' => Hash::make('Student123!'),
                ]
            );
            $student->assignRole('student');
            $students[] = $student;
        }

        return $students;
    }

    private function seedBuses(array $routes, array $drivers): array
    {
        $busesData = [
            [
                'bus_number' => 'BUS-221',
                'license_plate' => 'LEA-2211',
                'bus_type' => 'standard',
                'capacity' => 40,
                'route' => 'Lahore City Campus Loop',
                'driver' => 'Ayesha Kanwal',
                'status' => 'active',
            ],
            [
                'bus_number' => 'BUS-407',
                'license_plate' => 'ISB-4407',
                'bus_type' => 'premium',
                'capacity' => 45,
                'route' => 'Islamabad Tech Corridor',
                'driver' => 'Bilal Akram',
                'status' => 'active',
            ],
            [
                'bus_number' => 'BUS-512',
                'license_plate' => 'RWP-0512',
                'bus_type' => 'luxury',
                'capacity' => 38,
                'route' => 'Rawalpindi University Shuttle',
                'driver' => 'Usman Raza',
                'status' => 'maintenance',
            ],
        ];

        $buses = [];
        foreach ($busesData as $data) {
            $route = collect($routes)->firstWhere('name', $data['route']);
            $driver = collect($drivers)->firstWhere('name', $data['driver']);

            $bus = Bus::updateOrCreate(
                ['bus_number' => $data['bus_number']],
                [
                    'license_plate' => $data['license_plate'],
                    'bus_type' => $data['bus_type'],
                    'capacity' => $data['capacity'],
                    'current_route_id' => $route?->id,
                    'current_driver_id' => $driver?->id,
                    'status' => $data['status'],
                ]
            );

            $buses[] = $bus;
        }

        return $buses;
    }

    private function assignDriversToBuses(array $drivers, array $buses): void
    {
        foreach ($buses as $bus) {
            if (!$bus->current_driver_id) {
                continue;
            }

            $driver = collect($drivers)->firstWhere('id', $bus->current_driver_id);
            if (!$driver) {
                continue;
            }

            $driver->update([
                'assigned_bus_id' => $bus->id,
                'assigned_route_id' => $bus->current_route_id,
            ]);
        }
    }

    private function seedTrips(array $buses, array $drivers, array $routes): array
    {
        $trips = [];
        $now = now();

        foreach ($buses as $bus) {
            $driver = collect($drivers)->firstWhere('id', $bus->current_driver_id);
            $route = collect($routes)->firstWhere('id', $bus->current_route_id);
            if (!$driver || !$route) {
                continue;
            }

            $startTime = $now->copy()->subDays(2)->setTime(7, 30);
            $endTime = $startTime->copy()->addMinutes($route->estimated_duration ?? 40);

            $trips[] = Trip::updateOrCreate(
                ['bus_id' => $bus->id, 'start_time' => $startTime],
                [
                    'driver_id' => $driver->id,
                    'route_id' => $route->id,
                    'end_time' => $endTime,
                    'status' => 'completed',
                    'distance' => $route->distance,
                    'duration' => $route->estimated_duration,
                    'passenger_count' => random_int(18, 32),
                    'start_location' => ['latitude' => 0, 'longitude' => 0],
                    'end_location' => ['latitude' => 0, 'longitude' => 0],
                ]
            );

            $currentTripStart = $now->copy()->subMinutes(40);
            $trips[] = Trip::updateOrCreate(
                ['bus_id' => $bus->id, 'start_time' => $currentTripStart],
                [
                    'driver_id' => $driver->id,
                    'route_id' => $route->id,
                    'status' => 'in_progress',
                    'distance' => $route->distance,
                    'duration' => null,
                    'passenger_count' => random_int(10, 28),
                    'start_location' => ['latitude' => 0, 'longitude' => 0],
                ]
            );
        }

        return $trips;
    }

    private function seedLocations(array $buses, array $drivers): void
    {
        $locationSeeds = [
            ['lat' => 31.5204, 'lng' => 74.3587],
            ['lat' => 31.4775, 'lng' => 74.2643],
            ['lat' => 33.6844, 'lng' => 73.0479],
            ['lat' => 33.6995, 'lng' => 73.0369],
            ['lat' => 33.6407, 'lng' => 73.0776],
            ['lat' => 33.6167, 'lng' => 73.0667],
        ];

        foreach ($buses as $index => $bus) {
            if (Location::where('bus_id', $bus->id)->exists()) {
                continue;
            }

            $driver = collect($drivers)->firstWhere('id', $bus->current_driver_id);
            $base = $locationSeeds[$index % count($locationSeeds)];
            $recordedAt = now()->subMinutes(5);

            Location::create([
                'bus_id' => $bus->id,
                'driver_id' => $driver?->id,
                'latitude' => $base['lat'],
                'longitude' => $base['lng'],
                'accuracy' => 12.5,
                'speed' => 32.4,
                'heading' => 140,
                'recorded_at' => $recordedAt,
            ]);

            Location::create([
                'bus_id' => $bus->id,
                'driver_id' => $driver?->id,
                'latitude' => $base['lat'] + 0.0022,
                'longitude' => $base['lng'] + 0.0031,
                'accuracy' => 9.2,
                'speed' => 28.7,
                'heading' => 155,
                'recorded_at' => $recordedAt->copy()->addMinutes(3),
            ]);
        }
    }

    private function seedBookings(array $students, array $buses, array $trips): void
    {
        foreach ($students as $index => $student) {
            $bus = collect($buses)->firstWhere('current_route_id', $student->assigned_route_id);
            if (!$bus) {
                continue;
            }

            $tripDate = now()->addDays(($index % 5) + 1)->toDateString();
            $reference = 'BK-' . str_pad((string)($index + 1), 4, '0', STR_PAD_LEFT) . '-' . strtoupper(Str::random(4));

            $status = match ($index % 4) {
                0 => 'pending',
                1 => 'confirmed',
                2 => 'rejected',
                default => 'cancelled',
            };

            $booking = Booking::updateOrCreate(
                ['booking_reference' => $reference],
                [
                    'student_id' => $student->id,
                    'bus_id' => $bus->id,
                    'trip_id' => optional($trips[0])->id,
                    'seat_number' => 'A' . ($index + 1),
                    'trip_date' => $tripDate,
                    'status' => $status,
                ]
            );

            if ($status === 'rejected') {
                $booking->update([
                    'rejection_reason' => 'Seat already reserved for this trip.',
                    'rejected_at' => now()->subHours(6),
                ]);
            }

            if ($status === 'confirmed') {
                $booking->update([
                    'approved_at' => now()->subHours(3),
                ]);
            }
        }
    }

    private function seedFeesAndPayments(array $students): void
    {
        foreach ($students as $index => $student) {
            $fee = Fee::updateOrCreate(
                [
                    'user_id' => $student->id,
                    'fee_type' => 'transportation',
                    'semester' => 'Spring 2026',
                ],
                [
                    'amount' => 5000,
                    'due_date' => now()->addDays(15),
                    'status' => $index % 3 === 0 ? 'paid' : ($index % 3 === 1 ? 'pending' : 'overdue'),
                    'description' => 'University transport fee for Spring 2026.',
                ]
            );

            if ($fee->status === 'paid') {
                Payment::updateOrCreate(
                    ['transaction_id' => 'TXN-DEMO-' . $fee->id],
                    [
                        'user_id' => $student->id,
                        'fee_id' => $fee->id,
                        'amount' => $fee->amount,
                        'payment_method' => 'online',
                        'status' => 'completed',
                        'notes' => 'Bank transfer',
                    ]
                );
            }
        }
    }

    private function seedNotifications(array $students, array $drivers, array $buses, array $routes): void
    {
        foreach ($drivers as $driver) {
            $bus = collect($buses)->firstWhere('current_driver_id', $driver->id);
            if (!$bus) {
                continue;
            }

            $route = collect($routes)->firstWhere('id', $bus->current_route_id);
            $this->createNotification(
                $driver,
                'bus_assignment',
                'Bus assigned',
                'You have been assigned to bus ' . $bus->bus_number . '.',
                [
                    'bus_id' => $bus->id,
                    'bus_number' => $bus->bus_number,
                ]
            );

            if ($route) {
                $this->createNotification(
                    $driver,
                    'route_assignment',
                    'Route assigned',
                    'Your bus has been assigned to ' . $route->name . '.',
                    [
                        'route_id' => $route->id,
                        'route_name' => $route->name,
                    ]
                );
            }
        }

        foreach ($students as $student) {
            $this->createNotification(
                $student,
                'booking_status',
                'Booking update',
                'Your booking request has been received and is pending approval.',
                [
                    'status' => 'pending',
                ]
            );

            $this->createNotification(
                $student,
                'fee_invoice',
                'Fee reminder',
                'Your transport fee invoice is available in the portal.',
                [
                    'fee_type' => 'transportation',
                ]
            );
        }
    }

    private function seedAdminNotifications(array $admins, array $students, array $buses): void
    {
        foreach ($admins as $admin) {
            $this->createNotification(
                $admin,
                'system_update',
                'Daily operations ready',
                'All routes and drivers have been synchronized for today.',
                [
                    'students' => count($students),
                    'buses' => count($buses),
                ]
            );
        }
    }

    private function createNotification(User $user, string $type, string $title, string $message, array $data = []): void
    {
        Notification::firstOrCreate(
            [
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
            ],
            [
                'notifiable_type' => User::class,
                'notifiable_id' => $user->id,
                'notification_type' => 'info',
                'message' => $message,
                'data' => $data,
                'read' => false,
                'audience_type' => 'custom',
                'audience_ids' => [$user->id],
                'status' => 'sent',
                'sent_at' => now(),
            ]
        );
    }
}
