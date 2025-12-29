<?php

namespace App\Services\Bus;

use App\Models\Bus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StudentAssignmentService
{
    /**
     * Automatically assign students to a bus based on route and capacity
     * 
     * @param int $busId The bus ID to assign students to
     * @param int|null $routeId The route ID (if null, uses bus's current_route_id)
     * @return array Summary of assignments made
     */
    public function assignStudentsToBus($busId, $routeId = null)
    {
        try {
            $bus = Bus::findOrFail($busId);
            
            // Use provided route ID or bus's current route
            $routeIdToUse = $routeId ?? $bus->current_route_id;
            
            if (!$routeIdToUse) {
                return [
                    'success' => false,
                    'message' => 'No route assigned to bus',
                    'assigned_count' => 0,
                ];
            }

            // Get students with the same route who don't have a bus assigned
            $studentsToAssign = User::where('role', 'student')
                ->where('assigned_route_id', $routeIdToUse)
                ->where(function($query) {
                    $query->whereNull('assigned_bus_id')
                          ->orWhere('assigned_bus_id', 0);
                })
                ->where('status', 'active')
                ->orderBy('created_at', 'asc') // Assign oldest students first
                ->get();

            if ($studentsToAssign->isEmpty()) {
                return [
                    'success' => true,
                    'message' => 'No students available for assignment',
                    'assigned_count' => 0,
                ];
            }

            // Get current student assignments (students already assigned to this bus)
            $currentAssignedStudents = User::where('role', 'student')
                ->where('assigned_bus_id', $busId)
                ->where('status', 'active')
                ->count();

            $availableCapacity = max(0, $bus->capacity - $currentAssignedStudents);

            if ($availableCapacity <= 0) {
                return [
                    'success' => false,
                    'message' => 'Bus is at full capacity',
                    'assigned_count' => 0,
                    'bus_capacity' => $bus->capacity,
                    'current_assignments' => $currentAssignedStudents,
                ];
            }

            // Assign students up to available capacity
            $studentsToAssign = $studentsToAssign->take($availableCapacity);
            $assignedCount = 0;

            DB::beginTransaction();

            foreach ($studentsToAssign as $student) {
                // Update student's assigned_bus_id
                $student->update(['assigned_bus_id' => $busId]);
                $assignedCount++;

                // Note: Booking creation is optional - student assignment to bus is the key action
                // Bookings can be created later when a trip is scheduled
            }

            DB::commit();

            Log::info("Auto-assigned {$assignedCount} students to bus {$busId} for route {$routeIdToUse}");

            return [
                'success' => true,
                'message' => "Successfully assigned {$assignedCount} student(s) to bus",
                'assigned_count' => $assignedCount,
                'bus_capacity' => $bus->capacity,
                'available_capacity' => $availableCapacity - $assignedCount,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to assign students to bus: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to assign students: ' . $e->getMessage(),
                'assigned_count' => 0,
            ];
        }
    }

    /**
     * Assign students to all buses that have routes assigned
     * Useful for batch processing
     */
    public function assignStudentsToAllBuses()
    {
        $buses = Bus::whereNotNull('current_route_id')
            ->where('status', 'active')
            ->get();

        $results = [];
        
        foreach ($buses as $bus) {
            $result = $this->assignStudentsToBus($bus->id);
            $results[$bus->id] = $result;
        }

        return $results;
    }
}













