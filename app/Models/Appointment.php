<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'student_name', 'student_id', 'course_section', 'instructor',
        'consult_date', 'consult_time', 'reason', 'status',
    ];

    protected $casts = [
        'consult_date' => 'date:Y-m-d',
    ];

    // Return time as HH:MM for <input type="time">
    public function getConsultTimeAttribute($value): string
    {
        return substr($value, 0, 5);
    }
}
