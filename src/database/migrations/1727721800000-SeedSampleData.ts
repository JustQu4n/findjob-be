import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedSampleData1727721800000 implements MigrationInterface {
    name = 'SeedSampleData1727721800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert sample users
        await queryRunner.query(`
            INSERT INTO "users" ("full_name", "email", "password_hash", "phone", "status") VALUES 
            -- Admin user
            ('Admin User', 'admin@careervibe.com', '$2b$10$hashedpassword1', '+84901234567', 'active'),
            
            -- Employer users
            ('John Smith', 'john.smith@techcorp.com', '$2b$10$hashedpassword2', '+84901234568', 'active'),
            ('Sarah Johnson', 'sarah.johnson@innovatetech.com', '$2b$10$hashedpassword3', '+84901234569', 'active'),
            ('Michael Chen', 'michael.chen@globalsoft.com', '$2b$10$hashedpassword4', '+84901234570', 'active'),
            ('Emily Davis', 'emily.davis@startupco.com', '$2b$10$hashedpassword5', '+84901234571', 'active'),
            
            -- Job seeker users
            ('Nguyen Van An', 'nguyenvanan@gmail.com', '$2b$10$hashedpassword6', '+84901234572', 'active'),
            ('Tran Thi Binh', 'tranthibinh@gmail.com', '$2b$10$hashedpassword7', '+84901234573', 'active'),
            ('Le Quoc Cuong', 'lequoccuong@gmail.com', '$2b$10$hashedpassword8', '+84901234574', 'active'),
            ('Pham Thi Dung', 'phamthidung@gmail.com', '$2b$10$hashedpassword9', '+84901234575', 'active'),
            ('Hoang Van Duc', 'hoangvanduc@gmail.com', '$2b$10$hashedpassword10', '+84901234576', 'active'),
            ('Vu Thi Linh', 'vuthilinh@gmail.com', '$2b$10$hashedpassword11', '+84901234577', 'active'),
            ('Dao Van Minh', 'daovanminh@gmail.com', '$2b$10$hashedpassword12', '+84901234578', 'active'),
            ('Bui Thi Nga', 'buithinga@gmail.com', '$2b$10$hashedpassword13', '+84901234579', 'active')
        `);

        // Assign roles to users
        await queryRunner.query(`
            INSERT INTO "user_roles" ("user_id", "role_id") VALUES
            -- Admin role
            (1, (SELECT role_id FROM roles WHERE role_name = 'admin')),
            
            -- Employer roles
            (2, (SELECT role_id FROM roles WHERE role_name = 'employer')),
            (3, (SELECT role_id FROM roles WHERE role_name = 'employer')),
            (4, (SELECT role_id FROM roles WHERE role_name = 'employer')),
            (5, (SELECT role_id FROM roles WHERE role_name = 'employer')),
            
            -- Job seeker roles
            (6, (SELECT role_id FROM roles WHERE role_name = 'jobseeker')),
            (7, (SELECT role_id FROM roles WHERE role_name = 'jobseeker')),
            (8, (SELECT role_id FROM roles WHERE role_name = 'jobseeker')),
            (9, (SELECT role_id FROM roles WHERE role_name = 'jobseeker')),
            (10, (SELECT role_id FROM roles WHERE role_name = 'jobseeker')),
            (11, (SELECT role_id FROM roles WHERE role_name = 'jobseeker')),
            (12, (SELECT role_id FROM roles WHERE role_name = 'jobseeker')),
            (13, (SELECT role_id FROM roles WHERE role_name = 'jobseeker'))
        `);

        // Insert sample companies
        await queryRunner.query(`
            INSERT INTO "companies" ("name", "industry", "description", "location", "website") VALUES 
            ('TechCorp Vietnam', 'Technology', 'Leading technology company specializing in software development and digital transformation solutions.', 'Ho Chi Minh City, Vietnam', 'https://techcorp.vn'),
            ('InnovateTech Solutions', 'Information Technology', 'Innovative IT solutions provider focusing on cloud computing, AI, and machine learning technologies.', 'Hanoi, Vietnam', 'https://innovatetech.com.vn'),
            ('GlobalSoft International', 'Software Development', 'Global software development company with expertise in enterprise applications and mobile solutions.', 'Da Nang, Vietnam', 'https://globalsoft.com'),
            ('StartupCo', 'Fintech', 'Fast-growing fintech startup revolutionizing digital payments and financial services in Vietnam.', 'Ho Chi Minh City, Vietnam', 'https://startupco.vn'),
            ('VietNam Digital Agency', 'Digital Marketing', 'Full-service digital marketing agency helping businesses grow through online channels.', 'Hanoi, Vietnam', 'https://vietdigital.vn')
        `);

           // Insert admin profile
        await queryRunner.query(`
            INSERT INTO "admins" ("user_id", "department", "position", "permissions") VALUES 
            (1, 'System Administration', 'Super Admin', 
             '{"users": ["read", "create", "update", "delete"], "companies": ["read", "create", "update", "delete"], "job_posts": ["read", "create", "update", "delete"], "applications": ["read", "update"], "roles": ["read", "create", "update", "delete"], "system": ["manage", "configure"]}')
        `);

        // Insert employers
        await queryRunner.query(`
            INSERT INTO "employers" ("user_id", "company_id", "position") VALUES 
            (2, 1, 'Senior HR Manager'),
            (3, 2, 'Technical Recruiter'),
            (4, 3, 'Hiring Manager'),
            (5, 4, 'Head of People Operations')
        `);

        // Insert job seekers with detailed profiles
        await queryRunner.query(`
            INSERT INTO "job_seekers" ("user_id", "resume_url", "skills", "experience", "education") VALUES 
            (6, 'https://storage.careervibe.com/resumes/nguyen_van_an.pdf', 
             'JavaScript, React, Node.js, MongoDB, TypeScript, Git, AWS', 
             '3 years as Frontend Developer at ABC Company. Developed responsive web applications using React and Redux. Experience with REST APIs and modern JavaScript frameworks.',
             'Bachelor of Computer Science - FPT University (2019-2023), GPA: 3.5/4.0'),
             
            (7, 'https://storage.careervibe.com/resumes/tran_thi_binh.pdf',
             'Java, Spring Boot, MySQL, Docker, Kubernetes, Jenkins, Microservices',
             '2 years as Backend Developer at XYZ Tech. Built scalable microservices architecture and RESTful APIs. Experience with CI/CD pipelines and cloud deployment.',
             'Bachelor of Software Engineering - HCMC University of Technology (2020-2024), GPA: 3.7/4.0'),
             
            (8, 'https://storage.careervibe.com/resumes/le_quoc_cuong.pdf',
             'Python, Django, PostgreSQL, Redis, Celery, Data Analysis, Machine Learning',
             '4 years as Full Stack Developer. Specialized in Python web development and data processing. Built data analytics platforms and automated reporting systems.',
             'Master of Computer Science - Vietnam National University (2018-2022), GPA: 3.8/4.0'),
             
            (9, 'https://storage.careervibe.com/resumes/pham_thi_dung.pdf',
             'UI/UX Design, Figma, Adobe Creative Suite, Prototyping, User Research',
             '2.5 years as UI/UX Designer at Design Studio. Created user-centered designs for web and mobile applications. Conducted user research and usability testing.',
             'Bachelor of Graphic Design - RMIT University Vietnam (2019-2023), GPA: 3.6/4.0'),
             
            (10, 'https://storage.careervibe.com/resumes/hoang_van_duc.pdf',
             'DevOps, AWS, Terraform, Docker, Kubernetes, Linux, Monitoring',
             '3.5 years as DevOps Engineer. Managed cloud infrastructure and automated deployment pipelines. Expert in containerization and infrastructure as code.',
             'Bachelor of Information Technology - Hanoi University of Science and Technology (2018-2022), GPA: 3.4/4.0'),
             
            (11, 'https://storage.careervibe.com/resumes/vu_thi_linh.pdf',
             'Digital Marketing, SEO, SEM, Google Analytics, Facebook Ads, Content Marketing',
             '2 years as Digital Marketing Specialist. Managed social media campaigns and improved organic search rankings. Experience with marketing automation tools.',
             'Bachelor of Marketing - Foreign Trade University (2020-2024), GPA: 3.5/4.0'),
             
            (12, 'https://storage.careervibe.com/resumes/dao_van_minh.pdf',
             'Mobile Development, React Native, Flutter, iOS, Android, Firebase',
             '3 years as Mobile Developer. Built cross-platform mobile applications for startups and enterprises. Experience with app store deployment and optimization.',
             'Bachelor of Computer Engineering - Posts and Telecommunications Institute of Technology (2019-2023), GPA: 3.6/4.0'),
             
            (13, 'https://storage.careervibe.com/resumes/bui_thi_nga.pdf',
             'Quality Assurance, Test Automation, Selenium, API Testing, Performance Testing',
             '2.5 years as QA Engineer. Developed automated test suites and performed manual testing. Experience with agile testing methodologies and bug tracking systems.',
             'Bachelor of Information Systems - University of Economics and Law (2020-2024), GPA: 3.3/4.0')
        `);

        // Insert job posts
        await queryRunner.query(`
            INSERT INTO "job_posts" ("employer_id", "company_id", "title", "description", "requirements", "salary_range", "location", "employment_type", "deadline") VALUES 
            -- TechCorp Vietnam jobs
            (1, 1, 'Senior Frontend Developer', 
             'We are looking for a Senior Frontend Developer to join our dynamic team. You will be responsible for developing user-facing features using modern JavaScript frameworks and ensuring great user experience.',
             'Bachelor degree in Computer Science or related field. 3+ years of experience with React/Vue.js. Strong knowledge of HTML5, CSS3, JavaScript ES6+. Experience with state management (Redux/Vuex). Knowledge of RESTful APIs and Git version control.',
             '25,000,000 - 35,000,000 VND', 'Ho Chi Minh City', 'full-time', '2025-11-30'),
             
            (1, 1, 'Backend Developer (Node.js)', 
             'Join our backend team to build scalable and robust server-side applications. You will work with microservices architecture and cloud technologies.',
             'Bachelor degree in Computer Science. 2+ years of Node.js experience. Knowledge of Express.js, MongoDB/PostgreSQL. Experience with Docker and AWS. Understanding of RESTful API design.',
             '20,000,000 - 30,000,000 VND', 'Ho Chi Minh City', 'full-time', '2025-12-15'),
             
            -- InnovateTech Solutions jobs
            (2, 2, 'DevOps Engineer', 
             'We need a DevOps Engineer to help us scale our infrastructure and improve our deployment processes. You will work with cutting-edge cloud technologies.',
             'Bachelor degree in IT or related field. 2+ years of DevOps experience. Strong knowledge of AWS/Azure, Docker, Kubernetes. Experience with CI/CD pipelines (Jenkins/GitLab CI). Knowledge of Infrastructure as Code (Terraform).',
             '28,000,000 - 40,000,000 VND', 'Hanoi', 'full-time', '2025-11-20'),
             
            (2, 2, 'Machine Learning Engineer', 
             'Join our AI team to develop and deploy machine learning models that will power our next-generation products.',
             'Master degree in Computer Science, AI, or related field. 2+ years of ML experience. Strong Python skills, experience with TensorFlow/PyTorch. Knowledge of MLOps practices. Experience with cloud ML platforms.',
             '35,000,000 - 50,000,000 VND', 'Hanoi', 'full-time', '2025-12-01'),
             
            -- GlobalSoft International jobs
            (3, 3, 'Full Stack Developer (Java/React)', 
             'We are seeking a Full Stack Developer to work on enterprise applications. You will be involved in both frontend and backend development.',
             'Bachelor degree in Computer Science. 3+ years of Java development experience. Strong knowledge of Spring Boot, React.js. Experience with microservices architecture. Knowledge of database design and SQL.',
             '30,000,000 - 45,000,000 VND', 'Da Nang', 'full-time', '2025-11-25'),
             
            (3, 3, 'Mobile App Developer (React Native)', 
             'Join our mobile team to develop cross-platform applications for our clients worldwide.',
             'Bachelor degree in IT or related field. 2+ years of React Native experience. Knowledge of native iOS/Android development. Experience with app store deployment. Understanding of mobile UI/UX principles.',
             '22,000,000 - 32,000,000 VND', 'Da Nang', 'full-time', '2025-12-10'),
             
            -- StartupCo jobs
            (4, 4, 'UI/UX Designer', 
             'We are looking for a creative UI/UX Designer to help us create beautiful and intuitive user experiences for our fintech products.',
             'Bachelor degree in Design or related field. 2+ years of UI/UX design experience. Proficiency in Figma, Adobe Creative Suite. Experience with user research and prototyping. Portfolio showcasing mobile and web designs.',
             '18,000,000 - 28,000,000 VND', 'Ho Chi Minh City', 'full-time', '2025-11-18'),
             
            (4, 4, 'Frontend Developer Intern', 
             'Great opportunity for students or fresh graduates to gain real-world experience in a fast-growing fintech startup.',
             'Currently studying Computer Science or related field. Basic knowledge of HTML, CSS, JavaScript. Familiarity with React.js is a plus. Eager to learn and grow. Good English communication skills.',
             '8,000,000 - 12,000,000 VND', 'Ho Chi Minh City', 'internship', '2025-10-31'),
             
            (4, 4, 'Quality Assurance Engineer', 
             'We need a QA Engineer to ensure the quality and reliability of our fintech products.',
             'Bachelor degree in IT or related field. 2+ years of QA experience. Knowledge of manual and automated testing. Experience with test frameworks (Selenium, Jest). Understanding of API testing. Attention to detail.',
             '20,000,000 - 28,000,000 VND', 'Ho Chi Minh City', 'full-time', '2025-12-05')
        `);

        // Insert some sample applications
        await queryRunner.query(`
            INSERT INTO "applications" ("job_post_id", "job_seeker_id", "status") VALUES 
            -- Applications for Senior Frontend Developer
            (1, 1, 'pending'),
            (1, 7, 'reviewed'),
            
            -- Applications for Backend Developer
            (2, 2, 'accepted'),
            (2, 3, 'pending'),
            
            -- Applications for DevOps Engineer
            (3, 5, 'pending'),
            
            -- Applications for Full Stack Developer
            (5, 1, 'rejected'),
            (5, 3, 'pending'),
            
            -- Applications for Mobile App Developer
            (6, 6, 'reviewed'),
            
            -- Applications for UI/UX Designer
            (7, 4, 'accepted'),
            
            -- Applications for Frontend Intern
            (8, 1, 'pending'),
            (8, 2, 'pending'),
            
            -- Applications for QA Engineer
            (9, 8, 'reviewed')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete in reverse order due to foreign key constraints
        await queryRunner.query(`DELETE FROM "applications"`);
        await queryRunner.query(`DELETE FROM "job_posts"`);
        await queryRunner.query(`DELETE FROM "employers"`);
        await queryRunner.query(`DELETE FROM "job_seekers"`);
        await queryRunner.query(`DELETE FROM "companies"`);
        await queryRunner.query(`DELETE FROM "user_roles" WHERE user_id > 0`);
        await queryRunner.query(`DELETE FROM "users"`);
    }
}