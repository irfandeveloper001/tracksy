<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class LocationDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder validates that the location JSON files exist
     * and logs information about them.
     * The actual data is read on-demand via the LocationController API endpoint.
     */
    public function run(): void
    {
        $dataPath = base_path('database/data/locations');
        
        $this->command->info('🌍 Validating location data files...');
        
        $requiredFiles = [
            'countries.json',
            'states-cities.json',
            'universities.json',
        ];
        
        foreach ($requiredFiles as $file) {
            $filePath = $dataPath . '/' . $file;
            
            if (File::exists($filePath)) {
                $fileSize = File::size($filePath);
                $fileSizeMB = round($fileSize / 1024 / 1024, 2);
                
                // Validate JSON structure
                try {
                    $content = File::get($filePath);
                    $data = json_decode($content, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $count = is_array($data) ? count($data) : 'N/A';
                        $this->command->info("  ✅ {$file} - {$fileSizeMB} MB - {$count} items");
                        Log::info("Location data file validated: {$file}", [
                            'size' => $fileSizeMB . ' MB',
                            'items' => $count,
                        ]);
                    } else {
                        $this->command->error("  ❌ {$file} - Invalid JSON: " . json_last_error_msg());
                        Log::error("Invalid JSON in location file: {$file}", [
                            'error' => json_last_error_msg(),
                        ]);
                    }
                } catch (\Exception $e) {
                    $this->command->error("  ❌ {$file} - Error reading file: " . $e->getMessage());
                    Log::error("Error reading location file: {$file}", [
                        'error' => $e->getMessage(),
                    ]);
                }
            } else {
                $this->command->error("  ❌ {$file} - File not found at: {$filePath}");
                Log::warning("Location data file not found: {$file}", [
                    'expected_path' => $filePath,
                ]);
            }
        }
        
        $this->command->info('');
        $this->command->info('📍 Location data files validated!');
        $this->command->info('   Access location data via API: GET /api/admin/locations/countries');
        $this->command->info('                                  GET /api/admin/locations/states/{countryId}');
        $this->command->info('                                  GET /api/admin/locations/cities/{stateId}');
        $this->command->info('                                  GET /api/admin/locations/universities?country={name}&state={name}&city={name}');
        $this->command->info('');
    }
}
