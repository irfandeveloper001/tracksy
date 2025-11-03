<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middlewareGroups = [
        'api' => [
            \App\Http\Middleware\ApiAuth::class,
        ],
    ];

    protected $routeMiddleware = [
        'auth:api' => \App\Http\Middleware\ApiAuth::class,
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ];
}

