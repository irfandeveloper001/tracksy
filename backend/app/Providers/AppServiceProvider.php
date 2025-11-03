<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Set default string length for migrations (will be applied when database is ready)
        if ($this->app->bound('db')) {
            try {
                Schema::defaultStringLength(191);
            } catch (\Exception $e) {
                // Database not configured yet, will be set when migrations run
            }
        }
    }
}

