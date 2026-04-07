-- =============================================
-- Migration: 006_create_marks.sql
-- =============================================

CREATE TABLE IF NOT EXISTS marks (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id        INT UNSIGNED NOT NULL,
  subject_id        INT UNSIGNED NOT NULL,
  section_id        INT UNSIGNED NOT NULL,
  academic_year     VARCHAR(9)   NOT NULL,
  semester_id       INT UNSIGNED NOT NULL,

  -- CIE scores
  cie1              DECIMAL(5,2) DEFAULT NULL,
  cie2              DECIMAL(5,2) DEFAULT NULL,
  cie3              DECIMAL(5,2) DEFAULT NULL,

  -- Assignment scores
  assignment1       DECIMAL(5,2) DEFAULT NULL,
  assignment2       DECIMAL(5,2) DEFAULT NULL,

  -- Lab (only for lab/theory_lab subjects)
  lab_internal      DECIMAL(5,2) DEFAULT NULL,

  -- Attendance component (auto-calculated)
  attendance_marks  DECIMAL(5,2) DEFAULT NULL,

  -- Computed total
  total             DECIMAL(6,2) GENERATED ALWAYS AS (
    COALESCE(cie1, 0) + COALESCE(cie2, 0) + COALESCE(cie3, 0) +
    COALESCE(assignment1, 0) + COALESCE(assignment2, 0) +
    COALESCE(lab_internal, 0) + COALESCE(attendance_marks, 0)
  ) STORED,

  -- Workflow
  status            ENUM('draft','submitted','approved','locked') NOT NULL DEFAULT 'draft',
  submitted_by      INT UNSIGNED,
  submitted_at      TIMESTAMP,
  approved_by       INT UNSIGNED,
  approved_at       TIMESTAMP,
  locked_by         INT UNSIGNED,
  locked_at         TIMESTAMP,
  remarks           TEXT,

  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id)   REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (subject_id)   REFERENCES subjects(id)  ON DELETE RESTRICT,
  FOREIGN KEY (section_id)   REFERENCES sections(id)  ON DELETE RESTRICT,
  FOREIGN KEY (semester_id)  REFERENCES semesters(id) ON DELETE RESTRICT,
  FOREIGN KEY (submitted_by) REFERENCES users(id)     ON DELETE SET NULL,
  FOREIGN KEY (approved_by)  REFERENCES users(id)     ON DELETE SET NULL,
  FOREIGN KEY (locked_by)    REFERENCES users(id)     ON DELETE SET NULL,

  UNIQUE KEY uq_marks (student_id, subject_id, section_id, academic_year),
  INDEX idx_student   (student_id),
  INDEX idx_subject   (subject_id),
  INDEX idx_section   (section_id),
  INDEX idx_status    (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit trail for every marks change
CREATE TABLE IF NOT EXISTS marks_audit (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  marks_id     INT UNSIGNED NOT NULL,
  changed_by   INT UNSIGNED NOT NULL,
  field_name   VARCHAR(50)  NOT NULL,
  old_value    VARCHAR(50),
  new_value    VARCHAR(50),
  change_reason TEXT,
  changed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marks_id)   REFERENCES marks(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_marks_id   (marks_id),
  INDEX idx_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Marks lock configuration
CREATE TABLE IF NOT EXISTS marks_lock_config (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT UNSIGNED NOT NULL,
  section_id    INT UNSIGNED NOT NULL,
  academic_year VARCHAR(9)   NOT NULL,
  lock_deadline DATE,
  is_locked     BOOLEAN NOT NULL DEFAULT FALSE,
  locked_by     INT UNSIGNED,
  locked_at     TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (locked_by)  REFERENCES users(id)    ON DELETE SET NULL,
  UNIQUE KEY uq_lock (subject_id, section_id, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
