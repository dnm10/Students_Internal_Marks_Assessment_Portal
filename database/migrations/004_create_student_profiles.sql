-- =============================================
-- Migration: 004_create_student_profiles.sql
-- =============================================

CREATE TABLE IF NOT EXISTS student_profiles (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL UNIQUE,
  usn             VARCHAR(30)  NOT NULL UNIQUE COMMENT 'University Seat Number',
  branch_id       INT UNSIGNED NOT NULL,
  section_id      INT UNSIGNED NOT NULL,
  current_semester TINYINT UNSIGNED NOT NULL DEFAULT 1,
  admission_year  YEAR         NOT NULL,
  date_of_birth   DATE,
  gender          ENUM('Male','Female','Other'),
  guardian_name   VARCHAR(150),
  guardian_phone  VARCHAR(20),
  guardian_email  VARCHAR(191),
  address         TEXT,
  blood_group     VARCHAR(5),
  is_lateral_entry BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (branch_id)  REFERENCES branches(id) ON DELETE RESTRICT,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT,
  INDEX idx_usn        (usn),
  INDEX idx_branch_id  (branch_id),
  INDEX idx_section_id (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
