<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get system settings
     */
    public function getSystemSettings()
    {
        $settings = Setting::where('category', 'system')->pluck('value', 'key')->toArray();
        
        $defaults = [
            'app_name' => 'Tracksy Admin',
            'timezone' => 'UTC',
            'date_format' => 'YYYY-MM-DD',
            'time_format' => 'HH:mm',
            'language' => 'en',
        ];
        
        return $this->successResponse(array_merge($defaults, $settings));
    }

    /**
     * Update system settings
     */
    public function updateSystemSettings(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'sometimes|string|max:255',
            'timezone' => 'sometimes|string|max:50',
            'date_format' => 'sometimes|string|max:20',
            'time_format' => 'sometimes|string|max:20',
            'language' => 'sometimes|string|max:10',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key, 'category' => 'system'],
                ['value' => $value]
            );
        }

        return $this->successResponse($validated, 'System settings updated successfully');
    }

    /**
     * Get notification settings
     */
    public function getNotificationSettings()
    {
        $settings = Setting::where('category', 'notifications')->pluck('value', 'key')->toArray();
        
        $defaults = [
            'email_enabled' => true,
            'sms_enabled' => false,
            'push_enabled' => true,
        ];
        
        return $this->successResponse(array_merge($defaults, $settings));
    }

    /**
     * Update notification settings
     */
    public function updateNotificationSettings(Request $request)
    {
        $validated = $request->validate([
            'email_enabled' => 'sometimes|boolean',
            'email_provider' => 'sometimes|string|max:50',
            'email_from' => 'sometimes|string|email|max:255',
            'sms_enabled' => 'sometimes|boolean',
            'sms_provider' => 'sometimes|string|max:50',
            'push_enabled' => 'sometimes|boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key, 'category' => 'notifications'],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : $value]
            );
        }

        return $this->successResponse($validated, 'Notification settings updated successfully');
    }

    /**
     * Get map settings
     */
    public function getMapSettings()
    {
        $settings = Setting::where('category', 'map')->pluck('value', 'key')->toArray();
        
        $defaults = [
            'map_provider' => 'google',
            'default_zoom' => 12,
        ];
        
        return $this->successResponse(array_merge($defaults, $settings));
    }

    /**
     * Update map settings
     */
    public function updateMapSettings(Request $request)
    {
        $validated = $request->validate([
            'map_provider' => 'sometimes|in:google,mapbox,openstreetmap',
            'api_key' => 'sometimes|string|max:255',
            'default_zoom' => 'sometimes|integer|min:1|max:20',
            'default_center' => 'sometimes|array',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key, 'category' => 'map'],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return $this->successResponse($validated, 'Map settings updated successfully');
    }

    /**
     * Get security settings
     */
    public function getSecuritySettings()
    {
        $settings = Setting::where('category', 'security')->pluck('value', 'key')->toArray();
        
        $defaults = [
            'password_min_length' => 8,
            'password_require_uppercase' => true,
            'password_require_lowercase' => true,
            'password_require_numbers' => true,
            'password_require_symbols' => false,
            'session_timeout' => 30,
            'two_factor_enabled' => false,
        ];
        
        // Convert string booleans to actual booleans
        foreach ($defaults as $key => $defaultValue) {
            if (isset($settings[$key])) {
                $settings[$key] = $settings[$key] === '1' || $settings[$key] === 'true' || $settings[$key] === true;
            }
        }
        
        return $this->successResponse(array_merge($defaults, $settings));
    }

    /**
     * Update security settings
     */
    public function updateSecuritySettings(Request $request)
    {
        $validated = $request->validate([
            'password_min_length' => 'sometimes|integer|min:6|max:32',
            'password_require_uppercase' => 'sometimes|boolean',
            'password_require_lowercase' => 'sometimes|boolean',
            'password_require_numbers' => 'sometimes|boolean',
            'password_require_symbols' => 'sometimes|boolean',
            'session_timeout' => 'sometimes|integer|min:5|max:1440',
            'two_factor_enabled' => 'sometimes|boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key, 'category' => 'security'],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : $value]
            );
        }

        return $this->successResponse($validated, 'Security settings updated successfully');
    }

    /**
     * Get integration settings
     */
    public function getIntegrationSettings()
    {
        $settings = Setting::where('category', 'integrations')->pluck('value', 'key')->toArray();
        
        // Decode JSON values
        foreach ($settings as $key => $value) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settings[$key] = $decoded;
            }
        }
        
        return $this->successResponse($settings ?: []);
    }

    /**
     * Update integration settings
     */
    public function updateIntegrationSettings(Request $request)
    {
        $validated = $request->all();

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key, 'category' => 'integrations'],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return $this->successResponse($validated, 'Integration settings updated successfully');
    }

    /**
     * Upload logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = 'logo.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/logos', $filename);
            
            $url = asset('storage/logos/' . $filename);
            
            Setting::updateOrCreate(
                ['key' => 'app_logo', 'category' => 'system'],
                ['value' => $url]
            );

            return $this->successResponse(['url' => $url], 'Logo uploaded successfully');
        }

        return $this->errorResponse('No file uploaded', null, 400);
    }
}
