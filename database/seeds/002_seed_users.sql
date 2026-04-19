-- =============================================
-- Seed: 002_seed_users.sql
-- Passwords are bcrypt of 'Password@123'
-- =============================================
USE student_marks_portal;
SET @bcrypt_pass = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlrPPT1Z9M7OIYK';

-- Super Admin
INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified) VALUES
  (1, 'superadmin@portal.edu', @bcrypt_pass, 'Super', 'Admin', '9000000001', TRUE, TRUE);

-- Admin
INSERT INTO users (role_id, department_id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified) VALUES
  (2, 1, 'admin@portal.edu', @bcrypt_pass, 'College', 'Admin', '9000000002', TRUE, TRUE);

-- HODs
INSERT INTO users (role_id, department_id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified) VALUES
  (3, 1, 'hod.cse@portal.edu',  @bcrypt_pass, 'Dr. Ravi',  'Kumar',   '9000000003', TRUE, TRUE),
  (3, 2, 'hod.ece@portal.edu',  @bcrypt_pass, 'Dr. Priya', 'Sharma',  '9000000004', TRUE, TRUE);

-- Professors (department CSE = 1)
INSERT INTO users (role_id, department_id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified) VALUES
  (4, 1, 'prof.ramesh@portal.edu',  @bcrypt_pass, 'Ramesh',    'Babu',    '9000000005', TRUE, TRUE),
  (4, 1, 'prof.sunita@portal.edu',  @bcrypt_pass, 'Sunita',    'Rao',     '9000000006', TRUE, TRUE),
  (4, 1, 'prof.kiran@portal.edu',   @bcrypt_pass, 'Kiran',     'Patil',   '9000000007', TRUE, TRUE),
  (4, 1, 'prof.divya@portal.edu',   @bcrypt_pass, 'Divya',     'Nair',    '9000000008', TRUE, TRUE),
  (4, 1, 'prof.suresh@portal.edu',  @bcrypt_pass, 'Suresh',    'Menon',   '9000000009', TRUE, TRUE);

-- Students (20 students in CSE Section A, Sem 4)
INSERT INTO users (role_id, department_id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified) VALUES
  (5, 1, 'student01@portal.edu', @bcrypt_pass, 'Aarav',    'Sharma',    '9100000001', TRUE, TRUE),
  (5, 1, 'student02@portal.edu', @bcrypt_pass, 'Bhavya',   'Patel',     '9100000002', TRUE, TRUE),
  (5, 1, 'student03@portal.edu', @bcrypt_pass, 'Chetan',   'Singh',     '9100000003', TRUE, TRUE),
  (5, 1, 'student04@portal.edu', @bcrypt_pass, 'Deepika',  'Reddy',     '9100000004', TRUE, TRUE),
  (5, 1, 'student05@portal.edu', @bcrypt_pass, 'Eshan',    'Gupta',     '9100000005', TRUE, TRUE),
  (5, 1, 'student06@portal.edu', @bcrypt_pass, 'Falguni',  'Joshi',     '9100000006', TRUE, TRUE),
  (5, 1, 'student07@portal.edu', @bcrypt_pass, 'Gaurav',   'Verma',     '9100000007', TRUE, TRUE),
  (5, 1, 'student08@portal.edu', @bcrypt_pass, 'Harini',   'Krishnan',  '9100000008', TRUE, TRUE),
  (5, 1, 'student09@portal.edu', @bcrypt_pass, 'Ishaan',   'Mehta',     '9100000009', TRUE, TRUE),
  (5, 1, 'student10@portal.edu', @bcrypt_pass, 'Jaya',     'Nair',      '9100000010', TRUE, TRUE),
  (5, 1, 'student11@portal.edu', @bcrypt_pass, 'Karan',    'Malhotra',  '9100000011', TRUE, TRUE),
  (5, 1, 'student12@portal.edu', @bcrypt_pass, 'Lavanya',  'Iyer',      '9100000012', TRUE, TRUE),
  (5, 1, 'student13@portal.edu', @bcrypt_pass, 'Manish',   'Tiwari',    '9100000013', TRUE, TRUE),
  (5, 1, 'student14@portal.edu', @bcrypt_pass, 'Neha',     'Kulkarni',  '9100000014', TRUE, TRUE),
  (5, 1, 'student15@portal.edu', @bcrypt_pass, 'Omkar',    'Desai',     '9100000015', TRUE, TRUE),
  (5, 1, 'student16@portal.edu', @bcrypt_pass, 'Pooja',    'Bhat',      '9100000016', TRUE, TRUE),
  (5, 1, 'student17@portal.edu', @bcrypt_pass, 'Rahul',    'Pillai',    '9100000017', TRUE, TRUE),
  (5, 1, 'student18@portal.edu', @bcrypt_pass, 'Sneha',    'Gowda',     '9100000018', TRUE, TRUE),
  (5, 1, 'student19@portal.edu', @bcrypt_pass, 'Tejas',    'Patil',     '9100000019', TRUE, TRUE),
  (5, 1, 'student20@portal.edu', @bcrypt_pass, 'Usha',     'Rao',       '9100000020', TRUE, TRUE);

-- Student profiles
INSERT INTO student_profiles (user_id, usn, branch_id, section_id, current_semester, admission_year, gender) VALUES
  (8,  '1CS21001', 1, 1, 4, 2021, 'Male'),
  (9,  '1CS21002', 1, 1, 4, 2021, 'Female'),
  (10, '1CS21003', 1, 1, 4, 2021, 'Male'),
  (11, '1CS21004', 1, 1, 4, 2021, 'Female'),
  (12, '1CS21005', 1, 1, 4, 2021, 'Male'),
  (13, '1CS21006', 1, 1, 4, 2021, 'Female'),
  (14, '1CS21007', 1, 1, 4, 2021, 'Male'),
  (15, '1CS21008', 1, 1, 4, 2021, 'Female'),
  (16, '1CS21009', 1, 1, 4, 2021, 'Male'),
  (17, '1CS21010', 1, 1, 4, 2021, 'Female'),
  (18, '1CS21011', 1, 1, 4, 2021, 'Male'),
  (19, '1CS21012', 1, 1, 4, 2021, 'Female'),
  (20, '1CS21013', 1, 1, 4, 2021, 'Male'),
  (21, '1CS21014', 1, 1, 4, 2021, 'Female'),
  (22, '1CS21015', 1, 1, 4, 2021, 'Male'),
  (23, '1CS21016', 1, 1, 4, 2021, 'Female'),
  (24, '1CS21017', 1, 1, 4, 2021, 'Male'),
  (25, '1CS21018', 1, 1, 4, 2021, 'Female'),
  (26, '1CS21019', 1, 1, 4, 2021, 'Male'),
  (27, '1CS21020', 1, 1, 4, 2021, 'Female');
