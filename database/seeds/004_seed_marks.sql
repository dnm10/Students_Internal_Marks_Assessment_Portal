-- =============================================
-- Seed: 004_seed_marks.sql
-- Realistic marks for 20 students × 10 subjects
-- =============================================
USE student_marks_portal;
-- Helper: Insert marks for students (user_id 8-27) for subject 1 (DAA), section 1
INSERT INTO marks (student_id, subject_id, section_id, academic_year, semester_id, cie1, cie2, cie3, assignment1, assignment2, attendance_marks, status, submitted_by, submitted_at, approved_by, approved_at) VALUES
-- student01
(8,  1, 1, '2024-2025', 4, 26, 24, 27, 9, 8, 4, 'approved', 5, NOW(), 3, NOW()),
(8,  2, 1, '2024-2025', 4, 28, 22, 25, 8, 9, 5, 'approved', 5, NOW(), 3, NOW()),
(8,  3, 1, '2024-2025', 4, 24, 26, 23, 7, 8, 4, 'approved', 6, NOW(), 3, NOW()),
(8,  4, 1, '2024-2025', 4, 27, 25, 26, 9, 9, 5, 'approved', 6, NOW(), 3, NOW()),
(8,  5, 1, '2024-2025', 4, 25, 23, 24, 8, 7, 4, 'approved', 7, NOW(), 3, NOW()),
-- student02
(9,  1, 1, '2024-2025', 4, 22, 20, 23, 7, 8, 3, 'approved', 5, NOW(), 3, NOW()),
(9,  2, 1, '2024-2025', 4, 25, 24, 22, 9, 8, 4, 'approved', 5, NOW(), 3, NOW()),
(9,  3, 1, '2024-2025', 4, 28, 27, 26, 10,9, 5, 'approved', 6, NOW(), 3, NOW()),
(9,  4, 1, '2024-2025', 4, 29, 28, 27, 9, 10,5, 'approved', 6, NOW(), 3, NOW()),
(9,  5, 1, '2024-2025', 4, 26, 25, 24, 8, 9, 4, 'approved', 7, NOW(), 3, NOW()),
-- student03
(10, 1, 1, '2024-2025', 4, 18, 16, 20, 6, 7, 2, 'approved', 5, NOW(), 3, NOW()),
(10, 2, 1, '2024-2025', 4, 20, 19, 21, 7, 6, 3, 'approved', 5, NOW(), 3, NOW()),
(10, 3, 1, '2024-2025', 4, 22, 21, 19, 6, 7, 2, 'approved', 6, NOW(), 3, NOW()),
(10, 4, 1, '2024-2025', 4, 19, 18, 20, 7, 6, 2, 'approved', 6, NOW(), 3, NOW()),
(10, 5, 1, '2024-2025', 4, 21, 20, 18, 6, 7, 3, 'approved', 7, NOW(), 3, NOW()),
-- student04
(11, 1, 1, '2024-2025', 4, 30, 29, 28, 10,10,5, 'approved', 5, NOW(), 3, NOW()),
(11, 2, 1, '2024-2025', 4, 29, 30, 27, 10,9, 5, 'approved', 5, NOW(), 3, NOW()),
(11, 3, 1, '2024-2025', 4, 28, 27, 29, 9, 10,5, 'approved', 6, NOW(), 3, NOW()),
(11, 4, 1, '2024-2025', 4, 30, 28, 29, 10,10,5, 'approved', 6, NOW(), 3, NOW()),
(11, 5, 1, '2024-2025', 4, 27, 29, 28, 9, 10,5, 'approved', 7, NOW(), 3, NOW()),
-- student05
(12, 1, 1, '2024-2025', 4, 24, 22, 25, 8, 7, 4, 'approved', 5, NOW(), 3, NOW()),
(12, 2, 1, '2024-2025', 4, 23, 25, 24, 8, 8, 4, 'approved', 5, NOW(), 3, NOW()),
(12, 3, 1, '2024-2025', 4, 26, 24, 23, 7, 8, 4, 'approved', 6, NOW(), 3, NOW()),
(12, 4, 1, '2024-2025', 4, 25, 23, 24, 8, 7, 4, 'approved', 6, NOW(), 3, NOW()),
(12, 5, 1, '2024-2025', 4, 22, 24, 23, 7, 8, 3, 'approved', 7, NOW(), 3, NOW()),
-- students 06-10 (bulk)
(13, 1, 1, '2024-2025', 4, 21, 23, 20, 7, 8, 3, 'submitted', 5, NOW(), NULL, NULL),
(13, 2, 1, '2024-2025', 4, 24, 22, 23, 8, 7, 4, 'submitted', 5, NOW(), NULL, NULL),
(14, 1, 1, '2024-2025', 4, 27, 26, 25, 9, 8, 5, 'approved', 5, NOW(), 3, NOW()),
(14, 2, 1, '2024-2025', 4, 26, 28, 24, 8, 9, 4, 'approved', 5, NOW(), 3, NOW()),
(15, 1, 1, '2024-2025', 4, 23, 21, 22, 7, 6, 3, 'approved', 5, NOW(), 3, NOW()),
(15, 2, 1, '2024-2025', 4, 22, 20, 21, 6, 7, 3, 'approved', 5, NOW(), 3, NOW()),
(16, 1, 1, '2024-2025', 4, 25, 27, 24, 8, 9, 4, 'approved', 5, NOW(), 3, NOW()),
(16, 2, 1, '2024-2025', 4, 28, 26, 27, 9, 8, 5, 'approved', 5, NOW(), 3, NOW()),
(17, 1, 1, '2024-2025', 4, 20, 18, 19, 6, 7, 2, 'approved', 5, NOW(), 3, NOW()),
(17, 2, 1, '2024-2025', 4, 19, 21, 18, 7, 6, 2, 'approved', 5, NOW(), 3, NOW()),
-- students 11-20 draft marks
(18, 1, 1, '2024-2025', 4, 26, 25, 27, 9, 8, 4, 'draft', NULL, NULL, NULL, NULL),
(19, 1, 1, '2024-2025', 4, 24, 23, 22, 8, 7, 4, 'draft', NULL, NULL, NULL, NULL),
(20, 1, 1, '2024-2025', 4, 28, 27, 26, 9, 9, 5, 'draft', NULL, NULL, NULL, NULL),
(21, 1, 1, '2024-2025', 4, 22, 20, 21, 7, 6, 3, 'draft', NULL, NULL, NULL, NULL),
(22, 1, 1, '2024-2025', 4, 29, 28, 27, 10,9, 5, 'draft', NULL, NULL, NULL, NULL),
(23, 1, 1, '2024-2025', 4, 25, 24, 23, 8, 8, 4, 'draft', NULL, NULL, NULL, NULL),
(24, 1, 1, '2024-2025', 4, 21, 19, 20, 6, 7, 3, 'draft', NULL, NULL, NULL, NULL),
(25, 1, 1, '2024-2025', 4, 27, 26, 25, 9, 8, 4, 'draft', NULL, NULL, NULL, NULL),
(26, 1, 1, '2024-2025', 4, 23, 22, 24, 7, 8, 3, 'draft', NULL, NULL, NULL, NULL),
(27, 1, 1, '2024-2025', 4, 30, 29, 28, 10,10,5, 'draft', NULL, NULL, NULL, NULL);
