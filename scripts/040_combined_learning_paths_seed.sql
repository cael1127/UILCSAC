-- Combined Learning Paths Seed & Cleanup Script
-- Purpose: Purge starter/placeholder questions and seed substantive questions across modules
-- Idempotent: Each insert is guarded; users tables are not touched.

-- =============================
-- 1) PURGE STARTER/PLACEHOLDER
-- =============================

-- Remove dependent responses first (if exists)
WITH candidates AS (
  SELECT q.id
  FROM questions q
  LEFT JOIN LATERAL (
    SELECT array_agg(lower(trim(o.option_text)) ORDER BY lower(trim(o.option_text))) AS opts
    FROM question_options o WHERE o.question_id = q.id
  ) opt ON TRUE
  WHERE
    lower(q.question_text) LIKE 'which concept best relates to this module:%'
    OR lower(q.question_text) LIKE 'complete the code snippet relevant to:%'
    OR lower(q.question_text) LIKE '%sample question%'
    OR lower(q.question_text) LIKE '%starter question%'
    OR lower(coalesce(q.explanation, '')) LIKE '%checks basic understanding of the module topic%'
    OR lower(coalesce(q.explanation, '')) LIKE '%students should write a minimal correct snippet%'
    OR (
      q.question_type = 'multiple_choice' AND
      opt.opts IS NOT NULL AND (
        opt.opts = ARRAY['a','b','c','d']::text[] OR
        opt.opts = ARRAY['option a','option b','option c','option d']::text[]
      )
    )
)
DELETE FROM user_question_responses r
USING candidates c
WHERE r.question_id = c.id;

-- Delete the placeholder questions (question_options will cascade)
WITH candidates AS (
  SELECT q.id
  FROM questions q
  LEFT JOIN LATERAL (
    SELECT array_agg(lower(trim(o.option_text)) ORDER BY lower(trim(o.option_text))) AS opts
    FROM question_options o WHERE o.question_id = q.id
  ) opt ON TRUE
  WHERE
    lower(q.question_text) LIKE 'which concept best relates to this module:%'
    OR lower(q.question_text) LIKE 'complete the code snippet relevant to:%'
    OR lower(q.question_text) LIKE '%sample question%'
    OR lower(q.question_text) LIKE '%starter question%'
    OR lower(coalesce(q.explanation, '')) LIKE '%checks basic understanding of the module topic%'
    OR lower(coalesce(q.explanation, '')) LIKE '%students should write a minimal correct snippet%'
    OR (
      q.question_type = 'multiple_choice' AND
      opt.opts IS NOT NULL AND (
        opt.opts = ARRAY['a','b','c','d']::text[] OR
        opt.opts = ARRAY['option a','option b','option c','option d']::text[]
      )
    )
)
DELETE FROM questions q
USING candidates c
WHERE q.id = c.id;

-- =================
-- 2) SEED: SIMULATION
-- =================

WITH sim_modules AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%simulation%'
)
, mcq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT sm.id,
         'In a discrete-event simulation, which data structure best models future events?',
         'multiple_choice',
         'priority_queue',
         'Future events are typically scheduled based on time; a min-heap/priority queue retrieves the next event.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = sm.id), 0) + 1,
         2
  FROM sim_modules sm
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = sm.id AND q.question_text = 'In a discrete-event simulation, which data structure best models future events?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id,
       opt.option_text,
       (opt.option_text = 'priority_queue')::boolean,
       opt.order_index
FROM mcq
CROSS JOIN (
  VALUES ('stack',1), ('queue',2), ('priority_queue',3), ('deque',4)
) AS opt(option_text, order_index);

WITH sim_modules AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%simulation%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT sm.id,
       'Write a program to simulate a single-elevator system processing floor requests (up/down). Output final floor.',
       'code_completion',
       'implementation varies',
       'Track state (current floor, direction) and process requests in order received.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = sm.id), 0) + 1,
       3
FROM sim_modules sm
WHERE NOT EXISTS (
  SELECT 1 FROM questions q
  WHERE q.module_id = sm.id AND q.question_text = 'Write a program to simulate a single-elevator system processing floor requests (up/down). Output final floor.'
);

-- ======================
-- 3) SEED: JAVA BASICS
-- ======================

WITH basics AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%java basics%' OR lower(name) LIKE '%basics%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT b.id,
         'What is the default value of an uninitialized int field in a class?',
         'multiple_choice',
         '0',
         'Primitive int fields default to 0.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = b.id), 0) + 1,
         2
  FROM basics b
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = b.id AND q.question_text = 'What is the default value of an uninitialized int field in a class?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = '0')::boolean, opt.order_index
FROM q1
CROSS JOIN (VALUES ('null',1), ('0',2), ('undefined',3), ('1',4)) AS opt(option_text, order_index);

WITH basics AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%java basics%' OR lower(name) LIKE '%basics%'
)
, q2 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT b.id,
         'Which keyword creates a new object instance?',
         'multiple_choice',
         'new',
         'The new keyword allocates memory and returns a reference.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = b.id), 0) + 1,
         2
  FROM basics b
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = b.id AND q.question_text = 'Which keyword creates a new object instance?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'new')::boolean, opt.order_index
FROM q2
CROSS JOIN (VALUES ('alloc',1), ('create',2), ('new',3), ('make',4)) AS opt(option_text, order_index);

WITH basics AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%java basics%' OR lower(name) LIKE '%basics%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT b.id,
       'Read n followed by n integers and print their sum.',
       'code_completion',
       'implementation varies',
       'Use Scanner to read input and loop to accumulate the sum.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = b.id), 0) + 1,
       3
FROM basics b
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = b.id AND q.question_text = 'Read n followed by n integers and print their sum.'
);

-- ===============================
-- 4) SEED: CONTROL STRUCTURES
-- ===============================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%control%' OR lower(name) LIKE '%loops%'
)
, q1_cs AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'How many times does a for (int i=0; i<5; i++) loop run?',
         'multiple_choice',
         '5',
         'i = 0,1,2,3,4 → 5 times.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'How many times does a for (int i=0; i<5; i++) loop run?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = '5')::boolean, opt.order_index
FROM q1_cs
CROSS JOIN (VALUES ('4',1), ('5',2), ('6',3), ('0',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%control%' OR lower(name) LIKE '%loops%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n then n integers; print how many are even.',
       'code_completion',
       'implementation varies',
       'Use modulo and loop to count.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n then n integers; print how many are even.'
);

-- ==============================
-- 5) SEED: ARRAYS & COLLECTIONS
-- ==============================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%array%' OR lower(name) LIKE '%collection%'
)
, q1_ac AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which structure offers O(1) average-time lookup by key?',
         'multiple_choice',
         'HashMap',
         'HashMap offers expected O(1) average operations.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which structure offers O(1) average-time lookup by key?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'HashMap')::boolean, opt.order_index
FROM q1_ac
CROSS JOIN (VALUES ('ArrayList',1), ('LinkedList',2), ('HashMap',3), ('TreeMap',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%array%' OR lower(name) LIKE '%collection%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n, array, and k; rotate the array right by k and print space-separated.',
       'code_completion',
       'implementation varies',
       'Use reverse or extra array to rotate.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n, array, and k; rotate the array right by k and print space-separated.'
);

-- ==========================
-- 6) SEED: OOP (OBJECT-ORIENTED)
-- ==========================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%object%' OR lower(name) LIKE '%oop%'
)
, q1_oop AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which OOP principle allows treating subclasses as instances of their superclass?',
         'multiple_choice',
         'polymorphism',
         'Polymorphism enables a single interface with many implementations.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which OOP principle allows treating subclasses as instances of their superclass?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'polymorphism')::boolean, opt.order_index
FROM q1_oop
CROSS JOIN (VALUES ('encapsulation',1), ('inheritance',2), ('polymorphism',3), ('abstraction',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%object%' OR lower(name) LIKE '%oop%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Design classes Circle and Rectangle implementing a Shape interface with area(). Read shape type and parameters; print area.',
       'code_completion',
       'implementation varies',
       'Use interfaces/abstract classes and method overriding.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Design classes Circle and Rectangle implementing a Shape interface with area(). Read shape type and parameters; print area.'
);

-- =====================
-- 7) SEED: RECURSION
-- =====================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%recursion%'
)
, q1_rec AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'What is the base case in a recursive factorial function for n?',
         'multiple_choice',
         'n == 0',
         'Commonly factorial(0) = 1; base case checks n==0.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'What is the base case in a recursive factorial function for n?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'n == 0')::boolean, opt.order_index
FROM q1_rec
CROSS JOIN (VALUES ('n == 0',1), ('n == 1',2), ('n < 0',3), ('n > 1',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%recursion%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n and print the nth Fibonacci number.',
       'code_completion',
       'implementation varies',
       'Demonstrate recursion + memoization or an iterative approach.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n and print the nth Fibonacci number.'
);

-- ======================
-- 8) SEED: ALGORITHMS
-- ======================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%algorithm%' OR lower(name) LIKE '%sorting%' OR lower(name) LIKE '%search%'
)
, q1_alg AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which sort algorithm has O(n log n) average time and is not stable by default?',
         'multiple_choice',
         'quicksort',
         'Quicksort average time O(n log n), typically not stable.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which sort algorithm has O(n log n) average time and is not stable by default?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'quicksort')::boolean, opt.order_index
FROM q1_alg
CROSS JOIN (VALUES ('mergesort',1), ('heapsort',2), ('quicksort',3), ('bubblesort',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%algorithm%' OR lower(name) LIKE '%sorting%' OR lower(name) LIKE '%search%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n, sorted array, and target; print index via binary search or -1.',
       'code_completion',
       'implementation varies',
       'Use standard binary search template.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n, sorted array, and target; print index via binary search or -1.'
);

-- ============================
-- 9) SEED: TREES & GRAPHS
-- ============================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%tree%' OR lower(name) LIKE '%graph%'
)
, q1_tg AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which traversal visits root, then left subtree, then right subtree?',
         'multiple_choice',
         'preorder',
         'Preorder: root-left-right.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which traversal visits root, then left subtree, then right subtree?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'preorder')::boolean, opt.order_index
FROM q1_tg
CROSS JOIN (VALUES ('inorder',1), ('postorder',2), ('preorder',3), ('level order',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%tree%' OR lower(name) LIKE '%graph%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given n, m and m edges of an undirected graph, and s,t; print length of shortest path (BFS).',
       'code_completion',
       'implementation varies',
       'Use BFS from s; track distances; print distance to t or -1.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given n, m and m edges of an undirected graph, and s,t; print length of shortest path (BFS).'
);

-- ====================================
-- 10) SEED: DYNAMIC PROGRAMMING (DP)
-- ====================================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%dynamic%' OR lower(name) LIKE '%dp%'
)
, q1_dp AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which DP technique stores solutions to subproblems to avoid recomputation?',
         'multiple_choice',
         'memoization',
         'Memoization caches results of subproblems.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which DP technique stores solutions to subproblems to avoid recomputation?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'memoization')::boolean, opt.order_index
FROM q1_dp
CROSS JOIN (VALUES ('tabulation',1), ('greedy caching',2), ('memoization',3), ('branch and bound',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%dynamic%' OR lower(name) LIKE '%dp%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given coin denominations and total amount, print min number of coins or -1 if impossible.',
       'code_completion',
       'implementation varies',
       'Use classic DP array where dp[x] = min coins to make x.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given coin denominations and total amount, print min number of coins or -1 if impossible.'
);

-- ==========================================
-- 11) SEED: ADVANCED DATA STRUCTURES (HEAPS)
-- ==========================================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%advanced data%'
)
, q1_ads AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which data structure supports extract-min in O(log n)?',
         'multiple_choice',
         'min-heap',
         'A binary min-heap provides O(log n) extract-min.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         3
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which data structure supports extract-min in O(log n)?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'min-heap')::boolean, opt.order_index
FROM q1_ads
CROSS JOIN (VALUES ('stack',1), ('queue',2), ('min-heap',3), ('hash table',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%advanced data%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read q operations (push x / pop). Maintain a min-heap and print popped values.',
       'code_completion',
       'implementation varies',
       'Use priority queue / heap structure; handle underflow.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       5
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read q operations (push x / pop). Maintain a min-heap and print popped values.'
);

-- ==========================
-- 12) SEED: CONTEST PREP
-- ==========================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%contest%' OR lower(name) LIKE '%prep%'
)
, q1_cp AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Given constraints up to 1e5 operations, which complexity per operation is generally safe?',
         'multiple_choice',
         'O(log n)',
         'For 1e5 operations, O(log n) is typically safe in time limits.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given constraints up to 1e5 operations, which complexity per operation is generally safe?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'O(log n)')::boolean, opt.order_index
FROM q1_cp
CROSS JOIN (VALUES ('O(n^2)',1), ('O(n)',2), ('O(log n)',3), ('O(n log n)',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%contest%' OR lower(name) LIKE '%prep%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read input quickly and process T independent test cases (print sum for each).',
       'code_completion',
       'implementation varies',
       'Use buffered I/O or Scanner optimization and loop over T cases.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read input quickly and process T independent test cases (print sum for each).'
);

-- ==================================
-- 13) SEED: STACKS & QUEUES (~10)
-- ==================================

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
, q1_sq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which property defines a stack?',
         'multiple_choice',
         'LIFO',
         'Stack is Last-In-First-Out.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which property defines a stack?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'LIFO')::boolean, opt.order_index
FROM q1_sq
CROSS JOIN (VALUES ('FIFO',1), ('LILO',2), ('LIFO',3), ('Random',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
, q2_sq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which property defines a queue?',
         'multiple_choice',
         'FIFO',
         'Queue is First-In-First-Out.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which property defines a queue?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'FIFO')::boolean, opt.order_index
FROM q2_sq
CROSS JOIN (VALUES ('LIFO',1), ('Priority',2), ('Round-robin',3), ('FIFO',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
, q3_sq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Time complexity of push/pop on an array-backed stack (amortized)?',
         'multiple_choice',
         'O(1)',
         'Amortized O(1) for push/pop on dynamic array.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Time complexity of push/pop on an array-backed stack (amortized)?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'O(1)')::boolean, opt.order_index
FROM q3_sq
CROSS JOIN (VALUES ('O(n)',1), ('O(log n)',2), ('O(1)',3), ('O(n log n)',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
, q4_sq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which pair are fundamental queue operations?',
         'multiple_choice',
         'enqueue/dequeue',
         'Enqueue adds to back; dequeue removes from front.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which pair are fundamental queue operations?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'enqueue/dequeue')::boolean, opt.order_index
FROM q4_sq
CROSS JOIN (VALUES ('push/pop',1), ('insert/delete',2), ('enqueue/dequeue',3), ('offer/poll only',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
, q5_sq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which problem is naturally solved with a stack?',
         'multiple_choice',
         'parentheses matching',
         'Use stack to track opening symbols.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which problem is naturally solved with a stack?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'parentheses matching')::boolean, opt.order_index
FROM q5_sq
CROSS JOIN (VALUES ('bfs traversal',1), ('dijkstra',2), ('parentheses matching',3), ('hashing',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
, q6_sq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which use-case fits a queue best?',
         'multiple_choice',
         'BFS frontier',
         'Breadth-first search uses a queue for its frontier.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which use-case fits a queue best?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'BFS frontier')::boolean, opt.order_index
FROM q6_sq
CROSS JOIN (VALUES ('dfs recursion',1), ('BFS frontier',2), ('heap scheduling',3), ('union-find',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
, q7_sq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'A deque supports which ends for insertion/removal?',
         'multiple_choice',
         'both front and back',
         'Double-ended queue.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'A deque supports which ends for insertion/removal?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'both front and back')::boolean, opt.order_index
FROM q7_sq
CROSS JOIN (VALUES ('front only',1), ('back only',2), ('both front and back',3), ('neither',4)) AS opt(option_text, order_index);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given a string of brackets ()[]{}, print true if valid, else false.',
       'code_completion',
       'implementation varies',
       'Use stack to push openings and match closings.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given a string of brackets ()[]{}, print true if valid, else false.'
);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Implement a queue with two stacks. Process q operations: push x / pop and print popped values.',
       'code_completion',
       'implementation varies',
       'Maintain in/out stacks; shift when needed.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Implement a queue with two stacks. Process q operations: push x / pop and print popped values.'
);

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given array and window k, print sliding window maximums using a deque.',
       'code_completion',
       'implementation varies',
       'Use deque to keep decreasing indices; pop front when out of window.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       5
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given array and window k, print sliding window maximums using a deque.'
);


