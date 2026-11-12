# CICS Consultation Appointment System (Laravel + MySQL)

## Setup
1. Create a fresh Laravel project:  composer create-project laravel/laravel cics-consultation
2. Copy the files from this folder into it (same paths). Overwrite routes/web.php.
3. Copy .env.example values into your .env (DB_* settings).
4. Create the database, using ONE of:
   - php artisan migrate
   - mysql -u root -p < database/cics_consultation.sql
5. php artisan serve  ->  http://localhost:8000

## Files
- resources/views/index.blade.php   (your index.html as a Blade view)
- public/css/style.css              (original styles + additions)
- public/js/script.js               (now calls Laravel via fetch)
- routes/web.php, app/Http/Controllers/AppointmentController.php, app/Models/Appointment.php
- database/migrations/..., database/cics_consultation.sql
