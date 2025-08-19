-- Seed Learning Path Questions
-- Sample questions for Java Fundamentals to Advanced Algorithms

-- Get the learning path and modules
DO $$
DECLARE
    path_id UUID;
    basics_module_id UUID;
    control_module_id UUID;
    arrays_module_id UUID;
    oop_module_id UUID;
    question_type_mc UUID;
    question_type_written UUID;
    q_id UUID;
BEGIN
    -- Get the learning path
    SELECT id INTO path_id FROM learning_paths WHERE name = 'Java Fundamentals to Advanced Algorithms';
    
    -- Get the modules
    SELECT id INTO basics_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Java Basics & Variables';
    SELECT id INTO control_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Control Structures';
    SELECT id INTO arrays_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Arrays & Collections';
    SELECT id INTO oop_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Object-Oriented Programming';
    
    -- Get question types
    SELECT id INTO question_type_mc FROM question_types WHERE name = 'multiple_choice';
    SELECT id INTO question_type_written FROM question_types WHERE name = 'written';
    
    -- ===== MODULE 1: Java Basics & Variables =====
    
    -- Question 1: What is the correct way to declare a variable in Java?
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (basics_module_id, question_type_mc, 'Variable Declaration', 'What is the correct way to declare a variable in Java?', 'In Java, you must specify the data type before the variable name. The syntax is: dataType variableName;', 10, 1)
    ON CONFLICT DO NOTHING;
    
    -- Get the question ID and insert options
    SELECT id INTO q_id FROM questions WHERE title = 'Variable Declaration' AND path_module_id = basics_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'int x = 5;', true, 1),
    (q_id, 'x = 5;', false, 2),
    (q_id, 'var x = 5;', false, 3),
    (q_id, '5 = x;', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 2: What are the primitive data types in Java?
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (basics_module_id, question_type_mc, 'Primitive Data Types', 'Which of the following are primitive data types in Java?', 'Java has 8 primitive data types: byte, short, int, long, float, double, boolean, and char.', 15, 2)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO q_id FROM questions WHERE title = 'Primitive Data Types' AND path_module_id = basics_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'int, double, boolean, char', true, 1),
    (q_id, 'String, Integer, Double, Boolean', false, 2),
    (q_id, 'int, double, String, boolean', false, 3),
    (q_id, 'Integer, Double, Boolean, Character', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 3: Write a simple Java program
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (basics_module_id, question_type_written, 'Hello World Program', 'Write a complete Java program that prints "Hello, World!" to the console. Include the main method and proper syntax.', 'A basic Java program requires a class declaration and a main method. The main method is the entry point of the program.', 20, 3)
    ON CONFLICT DO NOTHING;
    
    -- ===== MODULE 2: Control Structures =====
    
    -- Question 4: If statement syntax
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (control_module_id, question_type_mc, 'If Statement Syntax', 'What is the correct syntax for an if statement in Java?', 'The if statement requires parentheses around the condition and curly braces for the code block.', 10, 1)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO q_id FROM questions WHERE title = 'If Statement Syntax' AND path_module_id = control_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'if (condition) { code }', true, 1),
    (q_id, 'if condition: code', false, 2),
    (q_id, 'if condition then code', false, 3),
    (q_id, 'if condition code', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 5: Loop structure
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (control_module_id, question_type_mc, 'For Loop Structure', 'What does this for loop do: for(int i = 0; i < 5; i++)?', 'This loop initializes i to 0, continues while i is less than 5, and increments i by 1 each iteration.', 15, 2)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO q_id FROM questions WHERE title = 'For Loop Structure' AND path_module_id = control_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'Executes 5 times with i values 0,1,2,3,4', true, 1),
    (q_id, 'Executes 5 times with i values 1,2,3,4,5', false, 2),
    (q_id, 'Executes 6 times with i values 0,1,2,3,4,5', false, 3),
    (q_id, 'Executes infinitely', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 6: Write a loop program
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (control_module_id, question_type_written, 'Number Sum Program', 'Write a Java program that uses a loop to calculate the sum of numbers from 1 to 10. Print the result.', 'Use a for loop to iterate from 1 to 10 and accumulate the sum in a variable.', 25, 3)
    ON CONFLICT DO NOTHING;
    
    -- ===== MODULE 3: Arrays & Collections =====
    
    -- Question 7: Array declaration
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (arrays_module_id, question_type_mc, 'Array Declaration', 'How do you declare an array of integers in Java?', 'Arrays in Java are declared with square brackets after the data type or variable name.', 10, 1)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO q_id FROM questions WHERE title = 'Array Declaration' AND path_module_id = arrays_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'int[] numbers;', true, 1),
    (q_id, 'int numbers[];', true, 2),
    (q_id, 'array int numbers;', false, 3),
    (q_id, 'int numbers;', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 8: ArrayList methods
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (arrays_module_id, question_type_mc, 'ArrayList Methods', 'Which method is used to add an element to an ArrayList?', 'The add() method is used to add elements to an ArrayList. It can add at the end or at a specific index.', 15, 2)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO q_id FROM questions WHERE title = 'ArrayList Methods' AND path_module_id = arrays_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'add()', true, 1),
    (q_id, 'insert()', false, 2),
    (q_id, 'append()', false, 3),
    (q_id, 'push()', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 9: Array manipulation
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (arrays_module_id, question_type_written, 'Array Sum Program', 'Write a Java program that creates an array of 5 integers, fills it with values 1,2,3,4,5, and then calculates and prints the sum of all elements.', 'Use a for loop to iterate through the array and accumulate the sum.', 25, 3)
    ON CONFLICT DO NOTHING;
    
    -- ===== MODULE 4: Object-Oriented Programming =====
    
    -- Question 10: Class definition
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (oop_module_id, question_type_mc, 'Class Definition', 'What keyword is used to define a class in Java?', 'The class keyword is used to define a class in Java. It must be followed by the class name.', 10, 1)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO q_id FROM questions WHERE title = 'Class Definition' AND path_module_id = oop_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'class', true, 1),
    (q_id, 'object', false, 2),
    (q_id, 'type', false, 3),
    (q_id, 'struct', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 11: Constructor
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (oop_module_id, question_type_mc, 'Constructor Purpose', 'What is the purpose of a constructor in Java?', 'A constructor is a special method that initializes an object when it is created. It has the same name as the class.', 15, 2)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO q_id FROM questions WHERE title = 'Constructor Purpose' AND path_module_id = oop_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'Initialize object state when created', true, 1),
    (q_id, 'Destroy objects', false, 2),
    (q_id, 'Define class methods', false, 3),
    (q_id, 'Import other classes', false, 4)
    ON CONFLICT DO NOTHING;
    
    -- Question 12: Create a simple class
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (oop_module_id, question_type_written, 'Student Class', 'Create a Student class with private fields for name (String) and grade (int). Include a constructor, getter methods, and a method to set the grade. Also create a main method to test the class.', 'This demonstrates encapsulation, constructors, getters, and setters in object-oriented programming.', 30, 3)
    ON CONFLICT DO NOTHING;
    
END $$;
