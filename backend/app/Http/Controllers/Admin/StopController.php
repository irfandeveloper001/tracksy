<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stop;
use Illuminate\Http\Request;

class StopController extends Controller
{
    public function index()
    {
        // List all stops
        $stops = Stop::with('routes')->get();
        
        return $this->successResponse($stops);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $stop = Stop::create($request->only([
            'name',
            'address',
            'latitude',
            'longitude',
        ]));

        return $this->successResponse($stop, 'Stop created successfully', 201);
    }

    public function show($id)
    {
        // Get stop details
        $stop = Stop::with('routes')->findOrFail($id);
        
        return $this->successResponse($stop);
    }

    public function update(Request $request, $id)
    {
        $stop = Stop::findOrFail($id);

        $this->validate($request, [
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
        ]);

        $stop->update($request->only([
            'name',
            'address',
            'latitude',
            'longitude',
        ]));

        return $this->successResponse($stop, 'Stop updated successfully');
    }

    public function destroy($id)
    {
        $stop = Stop::findOrFail($id);
        
        // Check if stop is used in any routes
        if ($stop->routes()->count() > 0) {
            return $this->errorResponse('Cannot delete stop that is assigned to routes', null, 422);
        }

        $stop->delete();

        return $this->successResponse(null, 'Stop deleted successfully');
    }
}

