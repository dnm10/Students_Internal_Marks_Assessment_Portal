-- =============================================
-- Migration: 007_create_attendance.sql
-- =============================================

CREATE TABLE IF NOT EXISTS attendance (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  INT UNSIGNED NOT NULL,
  subject_id  INT UNSIGNED NOT NULL,
  section_id  INT UNSIGNED NOT NULL,
  marked_by   INT UNSIGNED NOT NULL,
  date        DATE         NOT NULL,
  status      ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
  remarks     VARCHAR(255),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT,
  FOREIGN KEY (marked_by)  REFERENCES users(id)    ON DELETE RESTRICT,
  UNIQUE KEY uq_attendance (student_id, subject_id, date),
  INDEX idx_student_subj  (student_id, subject_id),
  INDEX idx_date          (date),
  INDEX idx_section       (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance summary (cached/updated on every mark)
CREATE TABLE IF NOT EXISTS attendance_summary (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id       INT UNSIGNED NOT NULL,
  subject_id       INT UNSIGNED NOT NULL,
  section_id       INT UNSIGNED NOT NULL,
  academic_year    VARCHAR(9)   NOT NULL,
  total_classes    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  classes_attended SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  attendance_pct   DECIMAL(5,2) GENERATED ALWAYS AS (
    IF(total_classes = 0, 0.00, ROUND(classes_attended * 100.0 / total_classes, 2))
  ) STORED,
  last_updated     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_summary (student_id, subject_id, section_id, academic_year),
  INDEX idx_student (student_id),
  INDEX idx_pct     (attendance_pct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
