import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedSkills1763349000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO skills (name) VALUES
            -- Programming Languages
            ('JavaScript'),
            ('TypeScript'),
            ('Python'),
            ('Java'),
            ('C#'),
            ('C++'),
            ('PHP'),
            ('Ruby'),
            ('Go'),
            ('Rust'),
            ('Swift'),
            ('Kotlin'),
            ('Dart'),
            ('SQL'),
            ('HTML'),
            ('CSS'),
            
            -- Frontend Frameworks & Libraries
            ('React'),
            ('Vue.js'),
            ('Angular'),
            ('Next.js'),
            ('Nuxt.js'),
            ('Svelte'),
            ('jQuery'),
            ('Bootstrap'),
            ('Tailwind CSS'),
            ('Material-UI'),
            ('Ant Design'),
            
            -- Backend Frameworks
            ('Node.js'),
            ('Express.js'),
            ('NestJS'),
            ('Django'),
            ('Flask'),
            ('FastAPI'),
            ('Spring Boot'),
            ('ASP.NET Core'),
            ('Laravel'),
            ('Ruby on Rails'),
            
            -- Mobile Development
            ('React Native'),
            ('Flutter'),
            ('iOS Development'),
            ('Android Development'),
            ('Xamarin'),
            
            -- Databases
            ('PostgreSQL'),
            ('MySQL'),
            ('MongoDB'),
            ('Redis'),
            ('Oracle'),
            ('SQL Server'),
            ('SQLite'),
            ('Firebase'),
            ('DynamoDB'),
            ('Cassandra'),
            ('Elasticsearch'),
            
            -- DevOps & Tools
            ('Docker'),
            ('Kubernetes'),
            ('Jenkins'),
            ('GitLab CI/CD'),
            ('GitHub Actions'),
            ('AWS'),
            ('Azure'),
            ('Google Cloud Platform'),
            ('Terraform'),
            ('Ansible'),
            ('Linux'),
            ('Nginx'),
            ('Apache'),
            
            -- Version Control
            ('Git'),
            ('GitHub'),
            ('GitLab'),
            ('Bitbucket'),
            
            -- Testing
            ('Jest'),
            ('Mocha'),
            ('Cypress'),
            ('Selenium'),
            ('JUnit'),
            ('PyTest'),
            ('Postman'),
            
            -- Soft Skills
            ('Communication'),
            ('Teamwork'),
            ('Leadership'),
            ('Problem Solving'),
            ('Critical Thinking'),
            ('Time Management'),
            ('Project Management'),
            ('Agile'),
            ('Scrum'),
            
            -- Design
            ('UI/UX Design'),
            ('Figma'),
            ('Adobe XD'),
            ('Sketch'),
            ('Photoshop'),
            ('Illustrator'),
            
            -- Data Science & AI
            ('Machine Learning'),
            ('Deep Learning'),
            ('TensorFlow'),
            ('PyTorch'),
            ('Data Analysis'),
            ('Data Visualization'),
            ('Pandas'),
            ('NumPy'),
            ('Scikit-learn'),
            
            -- Other Technologies
            ('GraphQL'),
            ('REST API'),
            ('Microservices'),
            ('WebSockets'),
            ('gRPC'),
            ('OAuth'),
            ('JWT'),
            ('Socket.io'),
            ('RabbitMQ'),
            ('Kafka')
            ON CONFLICT (name) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM skills WHERE name IN (
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'SQL', 'HTML', 'CSS',
            'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Ant Design',
            'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET Core', 'Laravel', 'Ruby on Rails',
            'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin',
            'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'SQLite', 'Firebase', 'DynamoDB', 'Cassandra', 'Elasticsearch',
            'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI/CD', 'GitHub Actions', 'AWS', 'Azure', 'Google Cloud Platform', 'Terraform', 'Ansible', 'Linux', 'Nginx', 'Apache',
            'Git', 'GitHub', 'GitLab', 'Bitbucket',
            'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'PyTest', 'Postman',
            'Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Time Management', 'Project Management', 'Agile', 'Scrum',
            'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
            'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis', 'Data Visualization', 'Pandas', 'NumPy', 'Scikit-learn',
            'GraphQL', 'REST API', 'Microservices', 'WebSockets', 'gRPC', 'OAuth', 'JWT', 'Socket.io', 'RabbitMQ', 'Kafka'
        )`);
    }
}
