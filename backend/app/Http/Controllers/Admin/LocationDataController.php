<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;

class LocationDataController extends Controller
{
    /**
     * Get all countries
     */
    public function getCountries()
    {
        return Cache::remember('locations.countries', 3600, function () {
            $filePath = base_path('database/data/locations/countries.json');
            
            if (!File::exists($filePath)) {
                return $this->errorResponse('Countries data file not found', null, 404);
            }
            
            try {
                $content = File::get($filePath);
                $countries = json_decode($content, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return $this->errorResponse('Invalid JSON in countries file: ' . json_last_error_msg(), null, 500);
                }
                
                return $this->successResponse($countries);
            } catch (\Exception $e) {
                return $this->errorResponse('Error reading countries file: ' . $e->getMessage(), null, 500);
            }
        });
    }

    /**
     * Get states for a specific country
     */
    public function getStates(Request $request, $countryId = null)
    {
        $countryId = $countryId ?? $request->input('country_id');
        
        if (!$countryId) {
            return $this->errorResponse('Country ID is required', null, 400);
        }
        
        $cacheKey = "locations.states.{$countryId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($countryId) {
            $filePath = base_path('database/data/locations/states-cities.json');
            
            if (!File::exists($filePath)) {
                return $this->errorResponse('States data file not found', null, 404);
            }
            
            try {
                $content = File::get($filePath);
                $allStates = json_decode($content, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return $this->errorResponse('Invalid JSON in states file: ' . json_last_error_msg(), null, 500);
                }
                
                // Filter states by country_id
                $states = array_filter($allStates, function ($state) use ($countryId) {
                    return isset($state['country_id']) && (string)$state['country_id'] === (string)$countryId;
                });
                
                // Re-index array
                $states = array_values($states);
                
                return $this->successResponse($states);
            } catch (\Exception $e) {
                return $this->errorResponse('Error reading states file: ' . $e->getMessage(), null, 500);
            }
        });
    }

    /**
     * Get cities for a specific state
     */
    public function getCities(Request $request, $stateId = null)
    {
        $stateId = $stateId ?? $request->input('state_id');
        
        if (!$stateId) {
            return $this->errorResponse('State ID is required', null, 400);
        }
        
        $cacheKey = "locations.cities.{$stateId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($stateId) {
            $filePath = base_path('database/data/locations/states-cities.json');
            
            if (!File::exists($filePath)) {
                return $this->errorResponse('States-Cities data file not found', null, 404);
            }
            
            try {
                $content = File::get($filePath);
                $allData = json_decode($content, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return $this->errorResponse('Invalid JSON in states-cities file: ' . json_last_error_msg(), null, 500);
                }
                
                // Find the state and extract its cities
                $state = null;
                foreach ($allData as $item) {
                    if (isset($item['id']) && (string)$item['id'] === (string)$stateId) {
                        $state = $item;
                        break;
                    }
                }
                
                if (!$state) {
                    return $this->successResponse([]);
                }
                
                // Extract cities from the state (cities are nested in the state object)
                $cities = $state['cities'] ?? [];
                
                return $this->successResponse($cities);
            } catch (\Exception $e) {
                return $this->errorResponse('Error reading cities file: ' . $e->getMessage(), null, 500);
            }
        });
    }

    /**
     * Search locations (countries, states, cities)
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $type = $request->input('type', 'all'); // 'country', 'state', 'city', 'all'
        
        if (empty($query)) {
            return $this->errorResponse('Search query is required', null, 400);
        }
        
        $results = [];
        
        try {
            // Search countries
            if ($type === 'all' || $type === 'country') {
                $countriesPath = base_path('database/data/locations/countries.json');
                if (File::exists($countriesPath)) {
                    $countries = json_decode(File::get($countriesPath), true);
                    $matchedCountries = array_filter($countries, function ($country) use ($query) {
                        return stripos($country['name'] ?? '', $query) !== false ||
                               stripos($country['iso2'] ?? '', $query) !== false ||
                               stripos($country['iso3'] ?? '', $query) !== false;
                    });
                    $results['countries'] = array_values($matchedCountries);
                }
            }
            
            // Search states and cities (limited to first 100 matches for performance)
            if ($type === 'all' || $type === 'state' || $type === 'city') {
                $statesCitiesPath = base_path('database/data/locations/states-cities.json');
                if (File::exists($statesCitiesPath)) {
                    $allData = json_decode(File::get($statesCitiesPath), true);
                    $matchedStates = [];
                    $matchedCities = [];
                    $count = 0;
                    
                    foreach ($allData as $state) {
                        if ($count >= 100) break;
                        
                        // Check state name
                        if (($type === 'all' || $type === 'state') && 
                            (stripos($state['name'] ?? '', $query) !== false)) {
                            $matchedStates[] = $state;
                            $count++;
                            continue;
                        }
                        
                        // Check cities in this state
                        if (($type === 'all' || $type === 'city') && isset($state['cities'])) {
                            foreach ($state['cities'] as $city) {
                                if ($count >= 100) break 2;
                                if (stripos($city['name'] ?? '', $query) !== false) {
                                    $matchedCities[] = array_merge($city, [
                                        'state_id' => $state['id'],
                                        'state_name' => $state['name'],
                                        'country_id' => $state['country_id'],
                                    ]);
                                    $count++;
                                }
                            }
                        }
                    }
                    
                    if (!empty($matchedStates)) {
                        $results['states'] = $matchedStates;
                    }
                    if (!empty($matchedCities)) {
                        $results['cities'] = array_slice($matchedCities, 0, 100);
                    }
                }
            }
            
            return $this->successResponse($results);
        } catch (\Exception $e) {
            return $this->errorResponse('Error searching locations: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get universities by country and state/province
     * Note: Universities dataset doesn't have city info, so we filter by country + state
     */
    public function getUniversities(Request $request, $cityId = null)
    {
        $countryName = $request->input('country');
        $stateName = $request->input('state');
        $cityName = $request->input('city'); // For labeling purposes only
        
        if (!$countryName) {
            return $this->errorResponse('Country name is required', null, 400);
        }
        
        $cacheKey = "locations.universities.{$countryName}." . ($stateName ?? 'nostate');
        
        return Cache::remember($cacheKey, 3600, function () use ($countryName, $stateName, $cityName) {
            $filePath = base_path('database/data/locations/universities.json');
            
            if (!File::exists($filePath)) {
                return $this->errorResponse('Universities data file not found', null, 404);
            }
            
            try {
                $content = File::get($filePath);
                $allUniversities = json_decode($content, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return $this->errorResponse('Invalid JSON in universities file: ' . json_last_error_msg(), null, 500);
                }
                
                // Filter universities by country (exact match)
                // Also include special cases for universities without state-province
                $filtered = array_filter($allUniversities, function ($uni) use ($countryName, $cityName) {
                    $countryMatch = isset($uni['country']) && 
                                    strcasecmp(trim($uni['country']), trim($countryName)) === 0;
                    
                    if (!$countryMatch) {
                        return false;
                    }
                    
                    return true; // Include all universities from the country, filtering by state happens next
                });
                
                // If state is provided, further filter by state-province (case-insensitive, flexible matching)
                if ($stateName) {
                    $stateNameNormalized = strtolower(trim($stateName));
                    
                    // Handle common state name variations
                    $stateVariations = [
                        'punjab' => ['panjab', 'punjab'], // Handle Punjab/Panjab variation
                        'panjab' => ['punjab', 'panjab'],
                        'khyber pakhtunkhwa' => ['kp', 'khyber pakhtunkhwa', 'khyber pakhtunkhwa province'],
                        'kp' => ['khyber pakhtunkhwa', 'kp'],
                    ];
                    
                    // Get all variations for the selected state
                    $stateVariationsList = [$stateNameNormalized];
                    foreach ($stateVariations as $key => $variants) {
                        if ($stateNameNormalized === $key || in_array($stateNameNormalized, $variants)) {
                            $stateVariationsList = array_merge($stateVariationsList, $variants);
                            break;
                        }
                    }
                    $stateVariationsList = array_unique($stateVariationsList);
                    
                    $filtered = array_filter($filtered, function ($uni) use ($stateNameNormalized, $stateVariationsList, $cityName) {
                        $uniState = $uni['state-province'] ?? null;
                        $uniName = strtolower($uni['name'] ?? '');
                        
                        // If university has no state-province, check if city name is in university name
                        // OR if it's a known university for that city
                        // This helps include universities like "The Superior College" that don't have state data
                        if (!$uniState && $cityName) {
                            $cityNameLower = strtolower(trim($cityName));
                            
                            // Check if city name appears in university name
                            if (stripos($uniName, $cityNameLower) !== false) {
                                return true; // Include if city name matches
                            }
                            
                            // Special cases: Known universities in specific cities without state data
                            $knownCityUniversities = [
                                'lahore' => ['superior college', 'superior university', 'the superior college'],
                                // Add more mappings as needed: 'karachi' => [...], etc.
                            ];
                            
                            if (isset($knownCityUniversities[$cityNameLower])) {
                                foreach ($knownCityUniversities[$cityNameLower] as $knownName) {
                                    if (stripos($uniName, $knownName) !== false) {
                                        return true; // Include known universities for this city
                                    }
                                }
                            }
                            
                            // Also check if university name contains "superior" and city is Lahore
                            if ($cityNameLower === 'lahore' && stripos($uniName, 'superior') !== false) {
                                return true;
                            }
                        }
                        
                        // If no state-province and no city match, exclude it
                        if (!$uniState) {
                            return false;
                        }
                        
                        $uniStateNormalized = strtolower(trim($uniState));
                        
                        // Check against all variations
                        foreach ($stateVariationsList as $variation) {
                            // Exact match (case-insensitive)
                            if ($uniStateNormalized === $variation) {
                                return true;
                            }
                            
                            // Partial match (one contains the other)
                            if (stripos($uniStateNormalized, $variation) !== false ||
                                stripos($variation, $uniStateNormalized) !== false) {
                                return true;
                            }
                        }
                        
                        // Handle US state abbreviations
                        $usStateMap = [
                            'alabama' => ['al'], 'alaska' => ['ak'], 'arizona' => ['az'],
                            'arkansas' => ['ar'], 'california' => ['ca', 'cal'], 'colorado' => ['co'],
                            'connecticut' => ['ct'], 'delaware' => ['de'], 'florida' => ['fl'],
                            'georgia' => ['ga'], 'hawaii' => ['hi'], 'idaho' => ['id'],
                            'illinois' => ['il'], 'indiana' => ['in'], 'iowa' => ['ia'],
                            'kansas' => ['ks'], 'kentucky' => ['ky'], 'louisiana' => ['la'],
                            'maine' => ['me'], 'maryland' => ['md'], 'massachusetts' => ['ma', 'mass'],
                            'michigan' => ['mi'], 'minnesota' => ['mn'], 'mississippi' => ['ms'],
                            'missouri' => ['mo'], 'montana' => ['mt'], 'nebraska' => ['ne'],
                            'nevada' => ['nv'], 'new hampshire' => ['nh'], 'new jersey' => ['nj'],
                            'new mexico' => ['nm'], 'new york' => ['ny'], 'north carolina' => ['nc'],
                            'north dakota' => ['nd'], 'ohio' => ['oh'], 'oklahoma' => ['ok'],
                            'oregon' => ['or'], 'pennsylvania' => ['pa'], 'rhode island' => ['ri'],
                            'south carolina' => ['sc'], 'south dakota' => ['sd'], 'tennessee' => ['tn'],
                            'texas' => ['tx'], 'utah' => ['ut'], 'vermont' => ['vt'],
                            'virginia' => ['va'], 'washington' => ['wa'], 'west virginia' => ['wv'],
                            'wisconsin' => ['wi'], 'wyoming' => ['wy'],
                        ];
                        
                        // Check if either the selected state or university state matches via abbreviation
                        foreach ($usStateMap as $fullName => $abbrevs) {
                            $selectedMatches = ($stateNameNormalized === $fullName || in_array($stateNameNormalized, $abbrevs));
                            $uniMatches = ($uniStateNormalized === $fullName || in_array($uniStateNormalized, $abbrevs));
                            
                            if ($selectedMatches && $uniMatches) {
                                return true;
                            }
                        }
                        
                        return false;
                    });
                } else {
                    // If no state provided, include universities without state-province
                    // (they might be in countries that don't use states)
                }
                
                // Re-index array
                $filtered = array_values($filtered);
                
                // If city name is provided, prioritize universities with city name in their name
                // (but still include all universities from the state)
                $prioritized = [];
                $others = [];
                
                if ($cityName) {
                    $cityNameLower = strtolower(trim($cityName));
                    foreach ($filtered as $uni) {
                        $uniNameLower = strtolower($uni['name'] ?? '');
                        if (stripos($uniNameLower, $cityNameLower) !== false) {
                            $prioritized[] = $uni;
                        } else {
                            $others[] = $uni;
                        }
                    }
                } else {
                    $others = $filtered;
                }
                
                // Combine: prioritized first, then others
                $filtered = array_merge($prioritized, $others);
                
                // Format universities for frontend
                $formatted = array_map(function ($uni) use ($cityName) {
                    return [
                        'id' => md5($uni['name'] . ($uni['country'] ?? '')), // Generate unique ID
                        'name' => $uni['name'] ?? 'Unknown University',
                        'country' => $uni['country'] ?? '',
                        'state_province' => $uni['state-province'] ?? null,
                        'domains' => $uni['domains'] ?? [],
                        'web_pages' => $uni['web_pages'] ?? [],
                        'label' => $uni['name'] ?? 'Unknown University',
                        'value' => $uni['name'] ?? 'Unknown University',
                        'city_label' => $cityName ? "Universities in/around {$cityName}" : null,
                    ];
                }, $filtered);
                
                // Sort: prioritized (with city name) first, then others, both sorted alphabetically
                usort($formatted, function ($a, $b) use ($cityName) {
                    if ($cityName) {
                        $aHasCity = stripos(strtolower($a['name']), strtolower($cityName)) !== false;
                        $bHasCity = stripos(strtolower($b['name']), strtolower($cityName)) !== false;
                        
                        // Prioritize universities with city name
                        if ($aHasCity && !$bHasCity) return -1;
                        if (!$aHasCity && $bHasCity) return 1;
                    }
                    
                    // Then sort alphabetically
                    return strcasecmp($a['name'], $b['name']);
                });
                
                return $this->successResponse($formatted);
            } catch (\Exception $e) {
                return $this->errorResponse('Error reading universities file: ' . $e->getMessage(), null, 500);
            }
        });
    }
    
    /**
     * Get universities by country and state (alternative endpoint)
     */
    public function getUniversitiesByCountryAndState(Request $request)
    {
        $countryName = $request->input('country');
        $stateName = $request->input('state');
        
        if (!$countryName) {
            return $this->errorResponse('Country name is required', null, 400);
        }
        
        return $this->getUniversities($request);
    }
}
