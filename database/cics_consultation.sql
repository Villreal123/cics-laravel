-- MySQL schema for CICS Consultation Appointment System
CREATE DATABASE IF NOT EXISTS cics_consultation
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cics_consultation;

CREATE TABLE IF NOT EXISTS appointments (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_name   VARCHAR(150) NOT NULL,
  student_id     VARCHAR(50)  NOT NULL,
  course_section VARCHAR(100) NOT NULL,
  instructor     VARCHAR(150) NOT NULL,
  consult_date   DATE NOT NULL,
  consult_time   TIME NOT NULL,
  reason         TEXT NOT NULL,
  status         ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_instructor_slot (instructor, consult_date, consult_time),
  INDEX idx_student_id (student_id),
  INDEX idx_consult_date (consult_date)
) ENGINE=InnoDB;

INSERT INTO appointments
  (student_name, student_id, course_section, instructor, consult_date, consult_time, reason, status)
VALUES
  ('Juan Dela Cruz', '2023-00123', 'BSIT 2A', 'Prof. Santos', '2026-11-12', '10:00:00', 'Help with database normalization project', 'confirmed');
