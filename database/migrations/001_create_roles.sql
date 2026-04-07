-- =============================================
-- Migration: 001_create_roles.sql
-- Description: Create roles lookup table
-- =============================================

CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  description VARCHAR(255),
  permissions JSON,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (name, description, permissions) VALUES
  ('superadmin', 'Full system control', JSON_ARRAY('*')),
  ('admin',      'College-level administration', JSON_ARRAY('manage_users','manage_departments','manage_students','view_reports','bulk_import')),
  ('hod',        'Head of Department', JSON_ARRAY('approve_marks','view_department','view_reports','manage_subjects')),
  ('professor',  'Faculty member', JSON_ARRAY('enter_marks','mark_attendance','view_subjects','view_students')),
  ('student',    'Student user', JSON_ARRAY('view_own_marks','view_own_attendance','download_marksheet'));
