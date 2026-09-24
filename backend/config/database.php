<?php

use Illuminate\Support\Str;

// Every service connection uses its own env vars if set,
// otherwise falls back to the main DB_* settings (one shared database).
$service = fn (string $prefix) => [
    'driver' => 'pgsql',
    'host' => env($prefix.'_DB_HOST', env('DB_HOST', 'postgres')),
    'port' => env($prefix.'_DB_PORT', env('DB_PORT', '5432')),
    'database' => env($prefix.'_DB_DATABASE', env('DB_DATABASE', 'payroll_benefits')),
    'username' => env($prefix.'_DB_USERNAME', env('DB_USERNAME', 'payroll_user')),
    'password' => env($prefix.'_DB_PASSWORD', env('DB_PASSWORD', '')),
    'charset' => 'utf8',
    'prefix' => '',
    'prefix_indexes' => true,
    'search_path' => 'public',
    'sslmode' => 'prefer',
];

return [
    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'payroll_benefits'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', 'postgres'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'payroll_benefits'),
            'username' => env('DB_USERNAME', 'payroll_user'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => 'prefer',
        ],

        'employee' => $service('EMPLOYEE'),
        'auth' => $service('AUTH'),
        'payroll' => $service('PAYROLL'),
        'attendance' => $service('ATTENDANCE'),
        'compensation' => $service('COMPENSATION'),
        'claims' => $service('CLAIMS'),
        'benefits' => $service('BENEFITS'),
    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'payroll'), '_').'_database_'),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],
];