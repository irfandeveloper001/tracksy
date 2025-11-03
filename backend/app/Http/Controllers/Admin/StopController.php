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
        // Create new stop
        // TODO: Implement validation
        // TODO: Implement stop creation
    }

    public function show($id)
    {
        // Get stop details
        $stop = Stop::with('routes')->findOrFail($id);
        
        return $this->successResponse($stop);
    }

    public function update(Request $request, $id)
    {
        // Update stop
        // TODO: Implement validation
        // TODO: Implement stop update
    }

    public function destroy($id)
    {
        // Delete stop
        // TODO: Implement delete with route check
    }
}

