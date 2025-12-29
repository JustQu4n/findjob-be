-- Check if candidate_interviews has a primary key
SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'candidate_interviews' 
  AND constraint_type = 'PRIMARY KEY';

-- Check all columns in candidate_interviews
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'candidate_interviews'
ORDER BY ordinal_position;
