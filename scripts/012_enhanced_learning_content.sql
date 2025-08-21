-- Enhanced Learning Content System
-- This script adds comprehensive study materials, more questions, and retry mechanisms

-- First, let's add study material types
CREATE TABLE IF NOT EXISTS study_material_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert study material types
INSERT INTO study_material_types (name, description) VALUES
('reading', 'Text-based learning material'),
('video', 'Video tutorial or lecture'),
('interactive', 'Interactive coding exercise'),
('practice', 'Practice problems'),
('cheatsheet', 'Quick reference guide')
ON CONFLICT (name) DO NOTHING;

-- Create study materials table
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_module_id UUID NOT NULL REFERENCES path_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    material_type_id UUID NOT NULL REFERENCES study_material_types(id),
    external_url VARCHAR(500),
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user study progress table
CREATE TABLE IF NOT EXISTS user_study_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    study_material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, study_material_id)
);

-- Enhanced questions table with more fields
ALTER TABLE questions ADD COLUMN IF NOT EXISTS concept_tags TEXT[] DEFAULT '{}';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER DEFAULT 300;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS requires_study_material BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS study_material_prerequisites UUID[] DEFAULT '{}';

-- Enhanced user question responses with retry tracking
ALTER TABLE user_question_responses ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
ALTER TABLE user_question_responses ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;
ALTER TABLE user_question_responses ADD COLUMN IF NOT EXISTS study_materials_reviewed UUID[] DEFAULT '{}';

-- Create concept mastery tracking
CREATE TABLE IF NOT EXISTS user_concept_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    concept_tag VARCHAR(100) NOT NULL,
    mastery_level INTEGER DEFAULT 0, -- 0-100
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    last_practiced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, concept_tag)
);

-- Insert enhanced study materials for Java Fundamentals
INSERT INTO study_materials (path_module_id, title, content, material_type_id, order_index, is_required, duration_minutes) VALUES
-- Module 1: Java Basics
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1), 
 'Introduction to Java Programming', 
 'Java is a high-level, class-based, object-oriented programming language. It was designed to have as few implementation dependencies as possible, making it platform-independent.

Key Concepts:
• Java Virtual Machine (JVM)
• Platform Independence
• Object-Oriented Programming
• Strong Typing
• Automatic Memory Management

Java programs are compiled to bytecode, which can run on any JVM regardless of the underlying computer architecture.', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 1, true, 15),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1), 
 'Java Syntax and Structure', 
 'Every Java program follows a specific structure:

1. Package Declaration (optional)
2. Import Statements
3. Class Declaration
4. Main Method
5. Program Logic

Basic Syntax Rules:
• Semicolons end statements
• Curly braces define blocks
• Java is case-sensitive
• File names must match class names', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 2, true, 10),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1), 
 'Variables and Data Types', 
 'Java has two categories of data types:

Primitive Types:
• int: 32-bit integer (-2^31 to 2^31-1)
• double: 64-bit floating-point
• boolean: true or false
• char: 16-bit Unicode character

Reference Types:
• String: sequence of characters
• Arrays: collections of elements
• Classes: user-defined types

Variable Declaration:
int age = 25;
String name = "John";
double height = 1.75;', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 3, true, 20),

-- Module 2: Control Structures
((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1), 
 'Conditional Statements', 
 'Java provides several ways to make decisions in your code:

1. if Statement:
   if (condition) {
       // code to execute if true
   }

2. if-else Statement:
   if (condition) {
       // code if true
   } else {
       // code if false
   }

3. if-else if-else:
   if (condition1) {
       // code for condition1
   } else if (condition2) {
       // code for condition2
   } else {
       // default code
   }

4. Switch Statement:
   switch (variable) {
       case value1:
           // code for value1
           break;
       case value2:
           // code for value2
           break;
       default:
           // default code
   }', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 1, true, 25),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1), 
 'Loops and Iteration', 
 'Java provides three main types of loops:

1. for Loop:
   for (initialization; condition; increment) {
       // code to repeat
   }

2. while Loop:
   while (condition) {
       // code to repeat
   }

3. do-while Loop:
   do {
       // code to repeat
   } while (condition);

Loop Control:
• break: exits the loop immediately
• continue: skips to next iteration
• Nested loops for complex patterns', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 2, true, 20),

-- Module 3: Object-Oriented Programming
((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1), 
 'Classes and Objects', 
 'Classes are blueprints for creating objects. They define:

1. Attributes (instance variables)
2. Methods (behaviors)
3. Constructors (special methods for initialization)

Class Structure:
public class Car {
    // Attributes
    private String brand;
    private String model;
    private int year;
    
    // Constructor
    public Car(String brand, String model, int year) {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }
    
    // Methods
    public void start() {
        System.out.println("Starting " + brand + " " + model);
    }
}

Creating Objects:
Car myCar = new Car("Toyota", "Camry", 2020);
myCar.start();', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 1, true, 30),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1), 
 'Inheritance and Polymorphism', 
 'Inheritance allows a class to inherit properties and methods from another class.

Single Inheritance:
public class Vehicle {
    protected String brand;
    
    public void start() {
        System.out.println("Vehicle starting...");
    }
}

public class Car extends Vehicle {
    private String model;
    
    @Override
    public void start() {
        System.out.println("Car starting...");
    }
}

Polymorphism:
• Method Overriding: same method, different implementation
• Method Overloading: same method name, different parameters
• Runtime polymorphism through inheritance', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 2, true, 25),

-- Module 4: Data Structures
((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1), 
 'Arrays and Collections', 
 'Java provides several data structures:

1. Arrays: Fixed-size collections
   int[] numbers = {1, 2, 3, 4, 5};
   String[] names = new String[3];

2. ArrayList: Dynamic arrays
   ArrayList<String> list = new ArrayList<>();
   list.add("item");
   list.get(0);

3. HashMap: Key-value pairs
   HashMap<String, Integer> map = new HashMap<>();
   map.put("key", 42);
   int value = map.get("key");

4. HashSet: Unique elements
   HashSet<Integer> set = new HashSet<>();
   set.add(1);
   set.contains(1);', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 1, true, 30),

-- Module 5: Algorithms
((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1), 
 'Searching Algorithms', 
 'Common searching algorithms in Java:

1. Linear Search:
   public static int linearSearch(int[] arr, int target) {
       for (int i = 0; i < arr.length; i++) {
           if (arr[i] == target) {
               return i;
           }
       }
       return -1;
   }

2. Binary Search (requires sorted array):
   public static int binarySearch(int[] arr, int target) {
       int left = 0;
       int right = arr.length - 1;
       
       while (left <= right) {
           int mid = left + (right - left) / 2;
           
           if (arr[mid] == target) return mid;
           if (arr[mid] < target) left = mid + 1;
           else right = mid - 1;
       }
       return -1;
   }

Time Complexity:
• Linear Search: O(n)
• Binary Search: O(log n)', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 1, true, 35),

((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1), 
 'Sorting Algorithms', 
 'Essential sorting algorithms:

1. Bubble Sort:
   public static void bubbleSort(int[] arr) {
       int n = arr.length;
       for (int i = 0; i < n-1; i++) {
           for (int j = 0; j < n-i-1; j++) {
               if (arr[j] > arr[j+1]) {
                   int temp = arr[j];
                   arr[j] = arr[j+1];
                   arr[j+1] = temp;
               }
           }
       }
   }

2. Quick Sort:
   public static void quickSort(int[] arr, int low, int high) {
       if (low < high) {
           int pi = partition(arr, low, high);
           quickSort(arr, low, pi-1);
           quickSort(arr, pi+1, high);
       }
   }

Time Complexity:
• Bubble Sort: O(n²)
• Quick Sort: O(n log n) average, O(n²) worst case', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 2, true, 40);

-- Insert video study materials
INSERT INTO study_materials (path_module_id, title, content, material_type_id, external_url, order_index, is_required, duration_minutes) VALUES
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1), 
 'Java Programming Tutorial for Beginners', 
 'Comprehensive video tutorial covering Java fundamentals, syntax, and basic concepts.', 
 (SELECT id FROM study_material_types WHERE name = 'video'), 
 'https://www.youtube.com/watch?v=eIrMbAQSU34', 4, false, 45),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1), 
 'Java Control Flow Tutorial', 
 'Learn about if statements, loops, and switch statements in Java with practical examples.', 
 (SELECT id FROM study_material_types WHERE name = 'video'), 
 'https://www.youtube.com/watch?v=3AroqLjl6mY', 3, false, 30),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1), 
 'Java OOP Complete Course', 
 'Complete object-oriented programming course covering classes, objects, inheritance, and polymorphism.', 
 (SELECT id FROM study_material_types WHERE name = 'video'), 
 'https://www.youtube.com/watch?v=3dZ3Oj8cKtg', 3, false, 60);

-- Insert interactive practice materials
INSERT INTO study_materials (path_module_id, title, content, material_type_id, order_index, is_required, duration_minutes) VALUES
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1), 
 'Interactive Java Syntax Practice', 
 'Practice writing Java syntax, declaring variables, and understanding data types through interactive exercises.', 
 (SELECT id FROM study_material_types WHERE name = 'interactive'), 5, false, 20),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1), 
 'Control Flow Practice Problems', 
 'Solve problems using if statements, loops, and switch statements to reinforce your understanding.', 
 (SELECT id FROM study_material_types WHERE name = 'practice'), 4, false, 25),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1), 
 'OOP Design Challenge', 
 'Design classes and objects for real-world scenarios to practice object-oriented design principles.', 
 (SELECT id FROM study_material_types WHERE name = 'interactive'), 4, false, 30);

-- Insert cheatsheets
INSERT INTO study_materials (path_module_id, title, content, material_type_id, order_index, is_required, duration_minutes) VALUES
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1), 
 'Java Syntax Cheatsheet', 
 'QUICK REFERENCE:
• Variable Declaration: type name = value;
• String: String text = "Hello";
• Array: int[] numbers = {1, 2, 3};
• Method: public returnType methodName(params) {}
• Class: public class ClassName {}
• Import: import package.ClassName;
• Comments: // single line, /* multi-line */', 
 (SELECT id FROM study_material_types WHERE name = 'cheatsheet'), 6, false, 5),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1), 
 'Control Flow Cheatsheet', 
 'QUICK REFERENCE:
• if: if (condition) { code }
• if-else: if (condition) { code } else { code }
• switch: switch (var) { case value: code; break; }
• for: for (int i = 0; i < n; i++) { code }
• while: while (condition) { code }
• do-while: do { code } while (condition);
• break: exit loop
• continue: skip iteration', 
 (SELECT id FROM study_material_types WHERE name = 'cheatsheet'), 5, false, 5);

-- Now let's add more comprehensive questions with concept tags
UPDATE questions SET 
    concept_tags = ARRAY['variables', 'data_types', 'syntax'],
    difficulty_level = 1,
    time_limit_seconds = 120,
    max_attempts = 3
WHERE title LIKE '%Java%' OR title LIKE '%Variable%';

UPDATE questions SET 
    concept_tags = ARRAY['control_flow', 'conditionals', 'loops'],
    difficulty_level = 2,
    time_limit_seconds = 180,
    max_attempts = 3
WHERE title LIKE '%Control%' OR title LIKE '%Loop%';

UPDATE questions SET 
    concept_tags = ARRAY['oop', 'classes', 'objects', 'inheritance'],
    difficulty_level = 3,
    time_limit_seconds = 240,
    max_attempts = 3
WHERE title LIKE '%Class%' OR title LIKE '%Object%';

UPDATE questions SET 
    concept_tags = ARRAY['data_structures', 'arrays', 'collections'],
    difficulty_level = 3,
    time_limit_seconds = 300,
    max_attempts = 3
WHERE title LIKE '%Array%' OR title LIKE '%Collection%';

UPDATE questions SET 
    concept_tags = ARRAY['algorithms', 'searching', 'sorting', 'complexity'],
    difficulty_level = 4,
    time_limit_seconds = 360,
    max_attempts = 3
WHERE title LIKE '%Algorithm%' OR title LIKE '%Search%' OR title LIKE '%Sort%';

-- Add RLS policies for new tables
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_concept_mastery ENABLE ROW LEVEL SECURITY;

-- Study materials policies
CREATE POLICY "Allow authenticated users to read study materials" ON study_materials
    FOR SELECT TO authenticated USING (is_active = true);

-- User study progress policies
CREATE POLICY "Allow users to manage own study progress" ON user_study_progress
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- User concept mastery policies
CREATE POLICY "Allow users to manage own concept mastery" ON user_concept_mastery
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON study_materials TO authenticated;
GRANT ALL ON user_study_progress TO authenticated;
GRANT ALL ON user_concept_mastery TO authenticated;
GRANT SELECT ON study_material_types TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_materials_module ON study_materials(path_module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_study_progress_user ON user_study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_concept_mastery_user ON user_concept_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_concept_tags ON questions USING GIN(concept_tags);

-- Verify the setup
SELECT 
    'Study Materials Created' as status,
    COUNT(*) as count
FROM study_materials

UNION ALL

SELECT 
    'Study Material Types' as status,
    COUNT(*) as count
FROM study_material_types

UNION ALL

SELECT 
    'Questions with Concept Tags' as status,
    COUNT(*) as count
FROM questions 
WHERE concept_tags IS NOT NULL AND array_length(concept_tags, 1) > 0;

