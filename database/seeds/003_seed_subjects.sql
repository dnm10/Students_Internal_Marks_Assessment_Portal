-- =============================================
-- Seed: 003_seed_subjects_and_mappings.sql
-- =============================================
USE student_marks_portal;
-- Subjects for CSE Semester 4
INSERT INTO subjects (branch_id, semester_id, code, name, credits, subject_type) VALUES
  (1, 4, 'CS401', 'Design and Analysis of Algorithms', 4, 'theory'),
  (1, 4, 'CS402', 'Database Management Systems',       4, 'theory'),
  (1, 4, 'CS403', 'Computer Networks',                 4, 'theory'),
  (1, 4, 'CS404', 'Operating Systems',                 3, 'theory'),
  (1, 4, 'CS405', 'Software Engineering',              3, 'theory'),
  (1, 4, 'CS406L', 'DBMS Lab',                         1, 'lab'),
  (1, 4, 'CS407L', 'Networks Lab',                     1, 'lab'),
  (1, 4, 'CS408', 'Microcontrollers & Embedded Sys',   3, 'theory_lab'),
  (1, 4, 'CS409', 'Professional Ethics',               2, 'theory'),
  (1, 4, 'CS410', 'Advanced Java Programming',         3, 'theory');

-- Professor-Subject Mapping (Section A, Academic Year 2024-2025)
INSERT INTO professor_subject_mapping (professor_id, subject_id, section_id, academic_year) VALUES
  (5, 1, 1, '2024-2025'),   -- Ramesh -> DAA
  (5, 2, 1, '2024-2025'),   -- Ramesh -> DBMS
  (6, 3, 1, '2024-2025'),   -- Sunita -> CN
  (6, 4, 1, '2024-2025'),   -- Sunita -> OS
  (7, 5, 1, '2024-2025'),   -- Kiran  -> SE
  (7, 6, 1, '2024-2025'),   -- Kiran  -> DBMS Lab
  (8, 7, 1, '2024-2025'),   -- Divya  -> Networks Lab
  (8, 8, 1, '2024-2025'),   -- Divya  -> Embedded
  (9, 9, 1, '2024-2025'),   -- Suresh -> Ethics
  (9, 10,1, '2024-2025');   -- Suresh -> Java
