<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Illuminate\Database\Seeder;

/**
 * A few known Philippine holidays, for trying out the Employee
 * Self-Service holiday banner locally. Not wired into DatabaseSeeder::run()
 * on purpose (that file ships empty by design) — run manually:
 *   php artisan db:seed --class=HolidaySeeder
 */
class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            ['date' => '2026-01-01', 'name' => "New Year's Day", 'type' => 'regular'],
            ['date' => '2026-04-09', 'name' => 'Araw ng Kagitingan', 'type' => 'regular'],
            ['date' => '2026-05-01', 'name' => 'Labor Day', 'type' => 'regular'],
            ['date' => '2026-06-12', 'name' => 'Independence Day', 'type' => 'regular'],
            ['date' => '2026-08-21', 'name' => 'Ninoy Aquino Day', 'type' => 'special_non_working'],
            ['date' => '2026-11-30', 'name' => 'Bonifacio Day', 'type' => 'regular'],
            ['date' => '2026-12-25', 'name' => 'Christmas Day', 'type' => 'regular'],
            ['date' => '2026-12-30', 'name' => 'Rizal Day', 'type' => 'regular'],
        ];

        foreach ($holidays as $holiday) {
            Holiday::updateOrCreate(['date' => $holiday['date']], $holiday);
        }
    }
}
