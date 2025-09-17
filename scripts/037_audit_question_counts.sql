-- Audit question counts by learning path and module, including type breakdown
-- Read-only report for verification after cleanup/replacement

-- Questions by learning path (totals)
SELECT lp.id AS learning_path_id,
       lp.name AS learning_path_name,
       COUNT(q.id) AS total_questions,
       COUNT(*) FILTER (WHERE q.question_type = 'multiple_choice') AS mcq_count,
       COUNT(*) FILTER (WHERE q.question_type = 'code_completion') AS code_completion_count,
       COUNT(*) FILTER (WHERE q.question_type = 'written_response') AS written_response_count
FROM learning_paths lp
LEFT JOIN path_modules pm ON pm.learning_path_id = lp.id
LEFT JOIN questions q ON q.module_id = pm.id AND q.is_active = true
GROUP BY lp.id, lp.name
ORDER BY lp.name;

-- Questions by module (with order index bounds)
SELECT pm.learning_path_id,
       pm.id AS module_id,
       pm.name AS module_name,
       COUNT(q.id) AS total_questions,
       MIN(q.order_index) AS min_order_index,
       MAX(q.order_index) AS max_order_index,
       COUNT(*) FILTER (WHERE q.question_type = 'multiple_choice') AS mcq_count,
       COUNT(*) FILTER (WHERE q.question_type = 'code_completion') AS code_completion_count,
       COUNT(*) FILTER (WHERE q.question_type = 'written_response') AS written_response_count
FROM path_modules pm
LEFT JOIN questions q ON q.module_id = pm.id AND q.is_active = true
GROUP BY pm.learning_path_id, pm.id, pm.name
ORDER BY pm.name;


