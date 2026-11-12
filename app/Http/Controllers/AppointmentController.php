<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    // Page
    public function page()
    {
        return view('index');
    }

    // READ: list with optional search + status filter
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query()->orderBy('consult_date')->orderBy('consult_time');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('student_name', 'like', "%{$search}%")
                  ->orWhere('student_id', 'like', "%{$search}%")
                  ->orWhere('instructor', 'like', "%{$search}%");
            });
        }

        if (($status = $request->query('status')) && $status !== 'all') {
            $query->where('status', $status);
        }

        return response()->json($query->get());
    }

    // CREATE
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        if ($this->slotTaken($data)) {
            return $this->conflict();
        }

        $appointment = Appointment::create($data);

        return response()->json($appointment, 201);
    }

    // UPDATE
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $this->validated($request);

        if ($this->slotTaken($data, $appointment->id)) {
            return $this->conflict();
        }

        $appointment->update($data);

        return response()->json($appointment->fresh());
    }

    // UPDATE STATUS only
    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        $appointment->update($data);

        return response()->json($appointment->fresh());
    }

    // DELETE
    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted.']);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'student_name'   => ['required', 'string', 'max:150'],
            'student_id'     => ['required', 'string', 'max:50'],
            'course_section' => ['required', 'string', 'max:100'],
            'instructor'     => ['required', 'string', 'max:150'],
            'consult_date'   => ['required', 'date', 'after_or_equal:today'],
            'consult_time'   => ['required', 'date_format:H:i'],
            'reason'         => ['required', 'string', 'max:1000'],
            'status'         => ['nullable', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        $data['status'] = $data['status'] ?? 'pending';

        return $data;
    }

    private function slotTaken(array $data, ?int $ignoreId = null): bool
    {
        return Appointment::where('instructor', $data['instructor'])
            ->where('consult_date', $data['consult_date'])
            ->where('consult_time', $data['consult_time'] . ':00')
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();
    }

    private function conflict(): JsonResponse
    {
        return response()->json([
            'message' => 'That instructor already has an appointment at this date and time.',
            'errors'  => ['consult_time' => ['Time slot is already booked.']],
        ], 422);
    }
}
