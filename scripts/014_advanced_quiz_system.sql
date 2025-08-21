-- Advanced Quiz System Enhancement
-- This script adds an advanced quiz system with study material prerequisites and adaptive difficulty

-- First, let's add more advanced questions that require study material completion
INSERT INTO questions (path_module_id, title, description, question_type_id, points, order_index, concept_tags, difficulty_level, time_limit_seconds, max_attempts, requires_study_material) VALUES

-- Advanced Java Concepts
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Lambda Expressions and Streams',
 'Implement a method using lambda expressions and streams to find all prime numbers in a range.',
 (SELECT id FROM question_types WHERE name = 'written'), 45, 10,
 ARRAY['lambda_expressions', 'streams', 'functional_programming', 'prime_numbers'], 5, 900, 3, true),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Generics and Type Safety',
 'Design a generic container class that can hold any type and provides type-safe operations.',
 (SELECT id FROM question_types WHERE name = 'written'), 40, 11,
 ARRAY['generics', 'type_safety', 'generic_classes', 'design'], 4, 720, 3, true),

-- Advanced Control Structures
((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'State Machine Implementation',
 'Implement a finite state machine for a vending machine using enums and switch statements.',
 (SELECT id FROM question_types WHERE name = 'written'), 50, 7,
 ARRAY['state_machines', 'enums', 'switch_statements', 'real_world_modeling'], 5, 900, 3, true),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Recursive Algorithm Design',
 'Design a recursive algorithm to solve the Tower of Hanoi problem and analyze its complexity.',
 (SELECT id FROM question_types WHERE name = 'written'), 45, 8,
 ARRAY['recursion', 'algorithm_design', 'complexity_analysis', 'problem_solving'], 4, 720, 3, true),

-- Advanced OOP
((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Factory Pattern Implementation',
 'Implement the Factory design pattern for creating different types of vehicles with proper abstraction.',
 (SELECT id FROM question_types WHERE name = 'written'), 55, 9,
 ARRAY['factory_pattern', 'design_patterns', 'abstraction', 'polymorphism'], 5, 900, 3, true),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Observer Pattern with Events',
 'Implement the Observer pattern using Java events and listeners for a stock market simulation.',
 (SELECT id FROM question_types WHERE name = 'written'), 50, 10,
 ARRAY['observer_pattern', 'events', 'listeners', 'real_time_systems'], 5, 900, 3, true),

-- Advanced Data Structures
((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Custom Priority Queue',
 'Implement a priority queue using a binary heap with custom comparator support.',
 (SELECT id FROM question_types WHERE name = 'written'), 55, 8,
 ARRAY['priority_queue', 'binary_heap', 'comparators', 'custom_implementation'], 5, 900, 3, true),

((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Trie Data Structure',
 'Implement a Trie data structure for efficient string prefix searching and autocomplete functionality.',
 (SELECT id FROM question_types WHERE name = 'written'), 60, 9,
 ARRAY['trie', 'string_algorithms', 'prefix_search', 'autocomplete'], 5, 900, 3, true),

-- Advanced Algorithms
((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Dynamic Programming - Knapsack',
 'Solve the 0/1 Knapsack problem using dynamic programming and analyze the solution.',
 (SELECT id FROM question_types WHERE name = 'written'), 65, 9,
 ARRAY['dynamic_programming', 'knapsack_problem', 'optimization', 'algorithm_analysis'], 5, 900, 3, true),

((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Graph Algorithms - Shortest Path',
 'Implement Dijkstra''s algorithm for finding shortest paths in a weighted graph.',
 (SELECT id FROM question_types WHERE name = 'written'), 60, 10,
 ARRAY['dijkstra', 'shortest_path', 'graphs', 'weighted_graphs', 'algorithm_implementation'], 5, 900, 3, true);

-- Now let's add more study materials for advanced concepts
INSERT INTO study_materials (path_module_id, title, content, material_type_id, order_index, is_required, duration_minutes) VALUES

-- Advanced Java Study Materials
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Lambda Expressions and Functional Programming',
 'Lambda expressions introduce functional programming concepts to Java:

Basic Syntax:
(parameters) -> { body }

Examples:
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .forEach(System.out::println);

Key Concepts:
• Functional interfaces
• Method references
• Stream operations
• Collectors
• Parallel streams

Benefits:
• More readable code
• Better performance with parallel processing
• Functional programming paradigm
• Reduced boilerplate code', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 7, true, 45),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Generics and Type Safety',
 'Generics provide compile-time type safety and eliminate the need for casting:

Generic Class:
public class Box<T> {
    private T content;
    
    public void set(T content) {
        this.content = content;
    }
    
    public T get() {
        return content;
    }
}

Generic Methods:
public static <T> void printArray(T[] array) {
    for (T element : array) {
        System.out.println(element);
    }
}

Bounded Types:
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}

Wildcards:
List<? extends Number> numbers; // Upper bound
List<? super Integer> integers;  // Lower bound', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 8, true, 40),

-- Advanced Control Structures Study Materials
((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'State Machines and Enums',
 'State machines model systems with distinct states and transitions:

Enum-based State Machine:
public enum VendingMachineState {
    IDLE, SELECTING, PROCESSING, DISPENSING, ERROR
}

State Transition:
public class VendingMachine {
    private VendingMachineState currentState = VendingMachineState.IDLE;
    
    public void insertCoin() {
        switch (currentState) {
            case IDLE:
                currentState = VendingMachineState.SELECTING;
                break;
            case SELECTING:
                // Already has coin
                break;
            default:
                throw new IllegalStateException("Cannot insert coin in " + currentState);
        }
    }
}

Benefits:
• Clear state representation
• Type-safe state transitions
• Easy to maintain and extend
• Prevents invalid state combinations', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 6, true, 35),

-- Advanced OOP Study Materials
((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Design Patterns - Factory Pattern',
 'The Factory pattern provides an interface for creating objects without specifying their exact class:

Abstract Factory:
public interface VehicleFactory {
    Vehicle createVehicle();
}

Concrete Factories:
public class CarFactory implements VehicleFactory {
    @Override
    public Vehicle createVehicle() {
        return new Car();
    }
}

public class MotorcycleFactory implements VehicleFactory {
    @Override
    public Vehicle createVehicle() {
        return new Motorcycle();
    }
}

Usage:
VehicleFactory factory = new CarFactory();
Vehicle vehicle = factory.createVehicle();

Benefits:
• Encapsulates object creation
• Promotes loose coupling
• Easy to extend with new types
• Centralized creation logic', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 7, true, 50),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Observer Pattern and Event Handling',
 'The Observer pattern defines a one-to-many dependency between objects:

Subject Interface:
public interface Subject {
    void registerObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers();
}

Observer Interface:
public interface Observer {
    void update(String message);
}

Concrete Implementation:
public class StockMarket implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private double stockPrice;
    
    public void setStockPrice(double price) {
        this.stockPrice = price;
        notifyObservers();
    }
    
    @Override
    public void registerObserver(Observer observer) {
        observers.add(observer);
    }
    
    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update("Stock price: $" + stockPrice);
        }
    }
}', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 8, true, 45),

-- Advanced Data Structures Study Materials
((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Priority Queue and Binary Heap',
 'A priority queue is a data structure where elements are ordered by priority:

Binary Heap Implementation:
public class PriorityQueue<T> {
    private List<T> heap;
    private Comparator<T> comparator;
    
    public void offer(T element) {
        heap.add(element);
        siftUp(heap.size() - 1);
    }
    
    public T poll() {
        if (heap.isEmpty()) return null;
        
        T result = heap.get(0);
        T last = heap.remove(heap.size() - 1);
        
        if (!heap.isEmpty()) {
            heap.set(0, last);
            siftDown(0);
        }
        
        return result;
    }
    
    private void siftUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (comparator.compare(heap.get(index), heap.get(parent)) >= 0) {
                break;
            }
            swap(index, parent);
            index = parent;
        }
    }
}', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 8, true, 55),

-- Advanced Algorithms Study Materials
((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Dynamic Programming - Knapsack Problem',
 'The 0/1 Knapsack problem is a classic optimization problem:

Problem: Given items with weights and values, maximize value while staying under weight limit.

Dynamic Programming Solution:
public class Knapsack {
    public static int solve(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];
        
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                if (weights[i-1] <= w) {
                    dp[i][w] = Math.max(
                        dp[i-1][w], 
                        dp[i-1][w - weights[i-1]] + values[i-1]
                    );
                } else {
                    dp[i][w] = dp[i-1][w];
                }
            }
        }
        
        return dp[n][capacity];
    }
}

Time Complexity: O(n * capacity)
Space Complexity: O(n * capacity)', 
 (SELECT id FROM study_material_types WHERE name = 'reading'), 8, true, 60);

-- Now let's create a quiz configuration system
CREATE TABLE IF NOT EXISTS quiz_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES path_modules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    question_count INTEGER NOT NULL DEFAULT 10,
    time_limit_minutes INTEGER NOT NULL DEFAULT 60,
    passing_score_percentage INTEGER NOT NULL DEFAULT 70,
    difficulty_distribution JSONB DEFAULT '{"easy": 30, "medium": 50, "hard": 20}',
    concept_coverage TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create adaptive quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_config_id UUID NOT NULL REFERENCES quiz_configurations(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    current_question_index INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, abandoned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz session responses
CREATE TABLE IF NOT EXISTS quiz_session_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_response TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    points_earned INTEGER DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert quiz configurations for each module
INSERT INTO quiz_configurations (module_id, name, description, question_count, time_limit_minutes, passing_score_percentage, difficulty_distribution, concept_coverage) VALUES

-- Java Basics Quiz
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Java Fundamentals Comprehensive Quiz',
 'Comprehensive assessment covering Java basics, syntax, memory management, and advanced features.',
 12, 90, 75,
 '{"easy": 25, "medium": 50, "hard": 25}',
 ARRAY['variables', 'data_types', 'syntax', 'memory_management', 'packages', 'access_modifiers', 'strings', 'lambda_expressions', 'generics']),

-- Control Structures Quiz
((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Control Flow Mastery Quiz',
 'Test understanding of control structures, loops, state machines, and recursive algorithms.',
 10, 75, 80,
 '{"easy": 20, "medium": 50, "hard": 30}',
 ARRAY['conditionals', 'loops', 'nested_control', 'state_machines', 'recursion', 'algorithmic_thinking']),

-- OOP Quiz
((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Object-Oriented Programming Advanced Quiz',
 'Advanced assessment of OOP concepts, design patterns, and real-world modeling.',
 12, 120, 80,
 '{"easy": 15, "medium": 45, "hard": 40}',
 ARRAY['classes', 'objects', 'inheritance', 'polymorphism', 'design_patterns', 'solid_principles', 'real_world_modeling']),

-- Data Structures Quiz
((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Data Structures and Implementation Quiz',
 'Test knowledge of data structures, performance characteristics, and custom implementations.',
 10, 90, 75,
 '{"easy": 20, "medium": 40, "hard": 40}',
 ARRAY['arrays', 'collections', 'performance', 'custom_implementation', 'advanced_structures']),

-- Algorithms Quiz
((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Algorithm Design and Analysis Quiz',
 'Comprehensive assessment of algorithm design, complexity analysis, and optimization.',
 12, 120, 80,
 '{"easy": 15, "medium": 40, "hard": 45}',
 ARRAY['searching', 'sorting', 'complexity_analysis', 'dynamic_programming', 'graph_algorithms', 'optimization']);

-- Add RLS policies for new tables
ALTER TABLE quiz_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_session_responses ENABLE ROW LEVEL SECURITY;

-- Quiz configurations policies
CREATE POLICY "Allow authenticated users to read quiz configurations" ON quiz_configurations
    FOR SELECT TO authenticated USING (is_active = true);

-- Quiz sessions policies
CREATE POLICY "Allow users to manage own quiz sessions" ON quiz_sessions
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Quiz session responses policies
CREATE POLICY "Allow users to manage own quiz responses" ON quiz_session_responses
    FOR ALL TO authenticated USING (
        quiz_session_id IN (
            SELECT id FROM quiz_sessions WHERE user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT SELECT ON quiz_configurations TO authenticated;
GRANT ALL ON quiz_sessions TO authenticated;
GRANT ALL ON quiz_session_responses TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_session_responses_session ON quiz_session_responses(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_configurations_module ON quiz_configurations(module_id);

-- Update questions to link with study materials
UPDATE questions SET 
    study_material_prerequisites = ARRAY[
        (SELECT id FROM study_materials WHERE title LIKE '%Lambda%' LIMIT 1),
        (SELECT id FROM study_materials WHERE title LIKE '%Generics%' LIMIT 1)
    ]
WHERE title LIKE '%Lambda%' OR title LIKE '%Generics%';

UPDATE questions SET 
    study_material_prerequisites = ARRAY[
        (SELECT id FROM study_materials WHERE title LIKE '%State Machine%' LIMIT 1),
        (SELECT id FROM study_materials WHERE title LIKE '%Recursion%' LIMIT 1)
    ]
WHERE title LIKE '%State Machine%' OR title LIKE '%Recursion%';

UPDATE questions SET 
    study_material_prerequisites = ARRAY[
        (SELECT id FROM study_materials WHERE title LIKE '%Factory Pattern%' LIMIT 1),
        (SELECT id FROM study_materials WHERE title LIKE '%Observer Pattern%' LIMIT 1)
    ]
WHERE title LIKE '%Factory Pattern%' OR title LIKE '%Observer Pattern%';

UPDATE questions SET 
    study_material_prerequisites = ARRAY[
        (SELECT id FROM study_materials WHERE title LIKE '%Priority Queue%' LIMIT 1),
        (SELECT id FROM study_materials WHERE title LIKE '%Trie%' LIMIT 1)
    ]
WHERE title LIKE '%Priority Queue%' OR title LIKE '%Trie%';

UPDATE questions SET 
    study_material_prerequisites = ARRAY[
        (SELECT id FROM study_materials WHERE title LIKE '%Knapsack%' LIMIT 1),
        (SELECT id FROM study_materials WHERE title LIKE '%Dijkstra%' LIMIT 1)
    ]
WHERE title LIKE '%Knapsack%' OR title LIKE '%Dijkstra%';

-- Verify the enhanced system
SELECT 
    'Advanced Questions Added' as metric,
    COUNT(*) as count
FROM questions 
WHERE difficulty_level >= 4

UNION ALL

SELECT 
    'Study Materials with Advanced Content' as metric,
    COUNT(*) as count
FROM study_materials 
WHERE title LIKE '%Advanced%' OR title LIKE '%Pattern%' OR title LIKE '%Algorithm%'

UNION ALL

SELECT 
    'Quiz Configurations Created' as metric,
    COUNT(*) as count
FROM quiz_configurations

UNION ALL

SELECT 
    'Questions Requiring Study Materials' as metric,
    COUNT(*) as count
FROM questions 
WHERE requires_study_material = true

UNION ALL

SELECT 
    'Total Study Materials' as metric,
    COUNT(*) as count
FROM study_materials;

