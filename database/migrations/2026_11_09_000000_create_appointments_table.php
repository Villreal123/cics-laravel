<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('student_name', 150);
            $table->string('student_id', 50)->index();
            $table->string('course_section', 100);
            $table->string('instructor', 150);
            $table->date('consult_date')->index();
            $table->time('consult_time');
            $table->text('reason');
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])
                  ->default('pending');
            $table->timestamps();

            // One booking per instructor per time slot
            $table->unique(['instructor', 'consult_date', 'consult_time'], 'uq_instructor_slot');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
