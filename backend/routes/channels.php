<?php

use Illuminate\Support\Facades\Broadcast;

// User-specific notification channel
Broadcast::channel('user.{userId}.notifications', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Bus location channel (authenticated users can subscribe)
Broadcast::channel('bus.{busId}.location', function ($user, $busId) {
    return $user !== null;
});

// Route deviation channel
Broadcast::channel('bus.{busId}.deviation', function ($user, $busId) {
    return $user !== null;
});

// Driver-specific message channel
Broadcast::channel('driver.{driverId}.messages', function ($user, $driverId) {
    return (int) $user->id === (int) $driverId && $user->role === 'driver';
});

// Driver trip updates
Broadcast::channel('driver.{driverId}.trips', function ($user, $driverId) {
    return (int) $user->id === (int) $driverId && $user->role === 'driver';
});

// Driver route updates
Broadcast::channel('driver.{driverId}.route-updates', function ($user, $driverId) {
    return (int) $user->id === (int) $driverId && $user->role === 'driver';
});

// Admin dashboard updates
Broadcast::channel('admin.dashboard', function ($user) {
    return in_array($user->role, ['admin', 'manager']);
});

// Admin bus updates
Broadcast::channel('admin.buses', function ($user) {
    return in_array($user->role, ['admin', 'manager']);
});

// Admin alerts
Broadcast::channel('admin.alerts', function ($user) {
    return in_array($user->role, ['admin', 'manager']);
});

