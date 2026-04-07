-- =============================================
-- Migration: 003_create_users.sql
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id             INT UNSIGNED NOT NULL,
  department_id       INT UNSIGNED,
  email               VARCHAR(191) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  first_name          VARCHAR(80)  NOT NULL,
  last_name           VARCHAR(80)  NOT NULL,
  phone               VARCHAR(20),
  profile_photo_url   VARCHAR(500),
  firebase_uid        VARCHAR(128),
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  is_email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
  last_login_at       TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE RESTRICT,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_email      (email),
  INDEX idx_role_id    (role_id),
  INDEX idx_dept_id    (department_id),
  INDEX idx_firebase   (firebase_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP    NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
