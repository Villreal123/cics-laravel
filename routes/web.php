<?php

use App\Http\Controllers\AppointmentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AppointmentController::class, 'page']);

Route::prefix('appointments')->group(function () {
    Route::get('/',               [AppointmentController::class, 'index']);
    Route::post('/',              [AppointmentController::class, 'store']);
    Route::put('/{appointment}',  [AppointmentController::class, 'update']);
    Route::patch('/{appointment}/status', [AppointmentController::class, 'updateStatus']);
    Route::delete('/{appointment}', [AppointmentController::class, 'destroy']);
});
