-- =============================================
-- Migration: 005_create_subjects.sql
-- =============================================

CREATE TABLE IF NOT EXISTS subjects (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id     INT UNSIGNED NOT NULL,
  semester_id   INT UNSIGNED NOT NULL,
  code          VARCHAR(20)  NOT NULL UNIQUE,
  name          VARCHAR(150) NOT NULL,
  credits       TINYINT UNSIGNED NOT NULL DEFAULT 3,
  subject_type  ENUM('theory','lab','theory_lab') NOT NULL DEFAULT 'theory',
  is_elective   BOOLEAN NOT NULL DEFAULT FALSE,
  max_cie1      TINYINT UNSIGNED NOT NULL DEFAULT 30,
  max_cie2      TINYINT UNSIGNED NOT NULL DEFAULT 30,
  max_cie3      TINYINT UNSIGNED NOT NULL DEFAULT 30,
  max_assignment1 TINYINT UNSIGNED NOT NULL DEFAULT 10,
  max_assignment2 TINYINT UNSIGNED NOT NULL DEFAULT 10,
  max_lab_internal TINYINT UNSIGNED NOT NULL DEFAULT 25,
  max_attendance_marks TINYINT UNSIGNED NOT NULL DEFAULT 5,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id)   REFERENCES branches(id)   ON DELETE RESTRICT,
  FOREIGN KEY (semester_id) REFERENCES semesters(id)  ON DELETE RESTRICT,
  INDEX idx_branch_sem (branch_id, semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS professor_subject_mapping (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  professor_id INT UNSIGNED NOT NULL,
  subject_id   INT UNSIGNED NOT NULL,
  section_id   INT UNSIGNED NOT NULL,
  academic_year VARCHAR(9) NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_id) REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (subject_id)   REFERENCES subjects(id)  ON DELETE CASCADE,
  FOREIGN KEY (section_id)   REFERENCES sections(id)  ON DELETE CASCADE,
  UNIQUE KEY uq_prof_sub_sec (professor_id, subject_id, section_id, academic_year),
  INDEX idx_professor (professor_id),
  INDEX idx_subject   (subject_id),
  INDEX idx_section   (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
