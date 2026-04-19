-- =============================================
-- Seed: 001_seed_base_data.sql
-- Description: Departments, branches, semesters, sections
-- =============================================
USE student_marks_portal;
-- Semesters
INSERT INTO semesters (number, label, is_current) VALUES
  (1, '1st Semester', FALSE),
  (2, '2nd Semester', FALSE),
  (3, '3rd Semester', FALSE),
  (4, '4th Semester', TRUE),
  (5, '5th Semester', FALSE),
  (6, '6th Semester', FALSE),
  (7, '7th Semester', FALSE),
  (8, '8th Semester', FALSE);

-- Departments
INSERT INTO departments (name, code, description) VALUES
  ('Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering'),
  ('Electronics & Communication Engineering', 'ECE', 'Department of Electronics and Communication'),
  ('Mechanical Engineering', 'ME', 'Department of Mechanical Engineering');

-- Branches
INSERT INTO branches (department_id, name, code) VALUES
  (1, 'B.E. Computer Science', 'BE-CSE'),
  (1, 'B.E. Data Science', 'BE-DS'),
  (2, 'B.E. Electronics & Communication', 'BE-ECE'),
  (3, 'B.E. Mechanical Engineering', 'BE-ME');

-- Sections (CSE Sem 4, Academic Year 2024-2025)
INSERT INTO sections (branch_id, semester_id, name, academic_year) VALUES
  (1, 4, 'A', '2024-2025'),
  (1, 4, 'B', '2024-2025'),
  (2, 4, 'A', '2024-2025'),
  (3, 4, 'A', '2024-2025');
