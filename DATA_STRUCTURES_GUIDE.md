# Data Structures Guide for Enhanced Java Runtime

## Overview

The Enhanced Java Runtime now supports comprehensive data structures with full API compatibility. This guide covers all supported data structures, their methods, and usage examples.

## 🚀 Supported Data Structures

### 1. **ArrayList**
Dynamic array implementation with automatic resizing.

#### **Methods:**
- `add(item)` - Add element to end
- `get(index)` - Get element at index
- `set(index, item)` - Set element at index
- `remove(index)` - Remove element at index
- `size()` - Get number of elements
- `isEmpty()` - Check if empty
- `contains(item)` - Check if contains element
- `indexOf(item)` - Get index of element
- `clear()` - Remove all elements
- `toString()` - String representation

#### **Example:**
```java
public class ArrayListExample {
    public static void main(String[] args) {
        ArrayList<Integer> list = new ArrayList<Integer>();
        
        // Adding elements
        list.add(10);
        list.add(20);
        list.add(30);
        System.out.println("List: " + list.toString()); // [10, 20, 30]
        
        // Accessing elements
        System.out.println("Element at index 1: " + list.get(1)); // 20
        
        // Modifying elements
        list.set(1, 25);
        System.out.println("After set: " + list.toString()); // [10, 25, 30]
        
        // Removing elements
        list.remove(0);
        System.out.println("After remove: " + list.toString()); // [25, 30]
        
        // Checking properties
        System.out.println("Size: " + list.size()); // 2
        System.out.println("Contains 25: " + list.contains(25)); // true
        System.out.println("Index of 30: " + list.indexOf(30)); // 1
    }
}
```

### 2. **HashMap**
Hash table implementation for key-value pairs.

#### **Methods:**
- `put(key, value)` - Add/update key-value pair
- `get(key)` - Get value for key
- `containsKey(key)` - Check if key exists
- `containsValue(value)` - Check if value exists
- `remove(key)` - Remove key-value pair
- `size()` - Get number of pairs
- `isEmpty()` - Check if empty
- `clear()` - Remove all pairs
- `keySet()` - Get all keys
- `values()` - Get all values
- `entrySet()` - Get all key-value pairs
- `toString()` - String representation

#### **Example:**
```java
public class HashMapExample {
    public static void main(String[] args) {
        HashMap<String, Integer> map = new HashMap<String, Integer>();
        
        // Adding key-value pairs
        map.put("apple", 5);
        map.put("banana", 3);
        map.put("orange", 8);
        System.out.println("Map: " + map.toString()); // {apple=5, banana=3, orange=8}
        
        // Accessing values
        System.out.println("Apples: " + map.get("apple")); // 5
        System.out.println("Grapes: " + map.get("grapes")); // null
        
        // Checking existence
        System.out.println("Has banana: " + map.containsKey("banana")); // true
        System.out.println("Has value 8: " + map.containsValue(8)); // true
        
        // Updating values
        map.put("apple", 7);
        System.out.println("Updated map: " + map.toString()); // {apple=7, banana=3, orange=8}
        
        // Removing entries
        map.remove("banana");
        System.out.println("After remove: " + map.toString()); // {apple=7, orange=8}
        
        // Getting collections
        System.out.println("Keys: " + map.keySet().toString()); // [apple, orange]
        System.out.println("Values: " + map.values().toString()); // [7, 8]
    }
}
```

### 3. **HashSet**
Hash table implementation for unique elements.

#### **Methods:**
- `add(item)` - Add element (returns true if added)
- `contains(item)` - Check if contains element
- `remove(item)` - Remove element
- `size()` - Get number of elements
- `isEmpty()` - Check if empty
- `clear()` - Remove all elements
- `toArray()` - Convert to array
- `toString()` - String representation

#### **Example:**
```java
public class HashSetExample {
    public static void main(String[] args) {
        HashSet<String> set = new HashSet<String>();
        
        // Adding elements
        set.add("red");
        set.add("green");
        set.add("blue");
        set.add("red"); // Duplicate - won't be added
        System.out.println("Set: " + set.toString()); // {red, green, blue}
        
        // Checking properties
        System.out.println("Size: " + set.size()); // 3
        System.out.println("Contains red: " + set.contains("red")); // true
        System.out.println("Contains yellow: " + set.contains("yellow")); // false
        
        // Adding more elements
        set.add("yellow");
        set.add("purple");
        System.out.println("After adding: " + set.toString()); // {red, green, blue, yellow, purple}
        
        // Removing elements
        set.remove("green");
        System.out.println("After remove: " + set.toString()); // {red, blue, yellow, purple}
        
        // Converting to array
        System.out.println("Array: " + set.toArray().toString());
    }
}
```

### 4. **LinkedList**
Doubly-linked list implementation.

#### **Methods:**
- `add(item)` - Add element to end
- `addFirst(item)` - Add element to beginning
- `addLast(item)` - Add element to end
- `get(index)` - Get element at index
- `getFirst()` - Get first element
- `getLast()` - Get last element
- `remove(index)` - Remove element at index
- `removeFirst()` - Remove first element
- `removeLast()` - Remove last element
- `size()` - Get number of elements
- `isEmpty()` - Check if empty
- `contains(item)` - Check if contains element
- `indexOf(item)` - Get index of element
- `clear()` - Remove all elements
- `toString()` - String representation

#### **Example:**
```java
public class LinkedListExample {
    public static void main(String[] args) {
        LinkedList<String> list = new LinkedList<String>();
        
        // Adding elements
        list.add("first");
        list.add("second");
        list.add("third");
        System.out.println("List: " + list.toString()); // [first, second, third]
        
        // Adding at specific positions
        list.addFirst("zero");
        list.addLast("fourth");
        System.out.println("After addFirst/addLast: " + list.toString()); // [zero, first, second, third, fourth]
        
        // Accessing elements
        System.out.println("First: " + list.getFirst()); // zero
        System.out.println("Last: " + list.getLast()); // fourth
        System.out.println("Index 2: " + list.get(2)); // second
        
        // Removing elements
        list.removeFirst();
        list.removeLast();
        System.out.println("After removeFirst/removeLast: " + list.toString()); // [first, second, third]
        
        // Other operations
        System.out.println("Size: " + list.size()); // 3
        System.out.println("Contains second: " + list.contains("second")); // true
        System.out.println("Index of third: " + list.indexOf("third")); // 2
    }
}
```

### 5. **Stack**
Last-In-First-Out (LIFO) data structure.

#### **Methods:**
- `push(item)` - Add element to top
- `pop()` - Remove and return top element
- `peek()` - Get top element without removing
- `size()` - Get number of elements
- `isEmpty()` - Check if empty
- `contains(item)` - Check if contains element
- `clear()` - Remove all elements
- `toString()` - String representation

#### **Example:**
```java
public class StackExample {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<Integer>();
        
        // Pushing elements
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("Stack: " + stack.toString()); // [10, 20, 30]
        
        // Peeking
        System.out.println("Top element: " + stack.peek()); // 30
        
        // Popping elements
        System.out.println("Popped: " + stack.pop()); // 30
        System.out.println("After pop: " + stack.toString()); // [10, 20]
        System.out.println("Top element: " + stack.peek()); // 20
        
        // More operations
        stack.push(40);
        stack.push(50);
        System.out.println("After pushing 40, 50: " + stack.toString()); // [10, 20, 40, 50]
        
        // Popping all elements
        System.out.println("Popping all elements:");
        while (!stack.isEmpty()) {
            System.out.println("Popped: " + stack.pop());
        }
        System.out.println("Is empty: " + stack.isEmpty()); // true
    }
}
```

### 6. **Queue**
First-In-First-Out (FIFO) data structure.

#### **Methods:**
- `offer(item)` - Add element to end
- `add(item)` - Add element to end
- `poll()` - Remove and return first element (returns null if empty)
- `remove()` - Remove and return first element (throws exception if empty)
- `peek()` - Get first element without removing (returns null if empty)
- `element()` - Get first element without removing (throws exception if empty)
- `size()` - Get number of elements
- `isEmpty()` - Check if empty
- `contains(item)` - Check if contains element
- `clear()` - Remove all elements
- `toString()` - String representation

#### **Example:**
```java
public class QueueExample {
    public static void main(String[] args) {
        Queue<String> queue = new Queue<String>();
        
        // Adding elements
        queue.offer("first");
        queue.offer("second");
        queue.offer("third");
        System.out.println("Queue: " + queue.toString()); // [first, second, third]
        
        // Peeking
        System.out.println("Front element: " + queue.peek()); // first
        
        // Polling elements
        System.out.println("Polled: " + queue.poll()); // first
        System.out.println("After poll: " + queue.toString()); // [second, third]
        System.out.println("Front element: " + queue.peek()); // second
        
        // More operations
        queue.add("fourth");
        queue.add("fifth");
        System.out.println("After adding: " + queue.toString()); // [second, third, fourth, fifth]
        
        // Polling all elements
        System.out.println("Polling all elements:");
        while (!queue.isEmpty()) {
            System.out.println("Polled: " + queue.poll());
        }
        System.out.println("Is empty: " + queue.isEmpty()); // true
    }
}
```

### 7. **PriorityQueue**
Min-heap implementation for priority-based operations.

#### **Methods:**
- `offer(item)` - Add element
- `add(item)` - Add element
- `poll()` - Remove and return minimum element (returns null if empty)
- `remove()` - Remove and return minimum element (throws exception if empty)
- `peek()` - Get minimum element without removing (returns null if empty)
- `element()` - Get minimum element without removing (throws exception if empty)
- `size()` - Get number of elements
- `isEmpty()` - Check if empty
- `contains(item)` - Check if contains element
- `clear()` - Remove all elements
- `toString()` - String representation

#### **Example:**
```java
public class PriorityQueueExample {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<Integer>();
        
        // Adding elements (not in order)
        pq.offer(30);
        pq.offer(10);
        pq.offer(50);
        pq.offer(20);
        System.out.println("PriorityQueue: " + pq.toString()); // [10, 20, 30, 50]
        
        // Peeking (minimum element)
        System.out.println("Min element: " + pq.peek()); // 10
        
        // Polling elements (in sorted order)
        System.out.println("Polled: " + pq.poll()); // 10
        System.out.println("After poll: " + pq.toString()); // [20, 30, 50]
        System.out.println("Min element: " + pq.peek()); // 20
        
        // Adding more elements
        pq.add(5);
        pq.add(40);
        System.out.println("After adding 5, 40: " + pq.toString()); // [5, 20, 30, 40, 50]
        
        // Polling all elements (in sorted order)
        System.out.println("Polling all elements in order:");
        while (!pq.isEmpty()) {
            System.out.println("Polled: " + pq.poll());
        }
        System.out.println("Is empty: " + pq.isEmpty()); // true
    }
}
```

### 8. **TreeSet**
Sorted set implementation using red-black tree.

#### **Methods:**
- `add(item)` - Add element (returns true if added)
- `contains(item)` - Check if contains element
- `remove(item)` - Remove element
- `first()` - Get first (smallest) element
- `last()` - Get last (largest) element
- `size()` - Get number of elements
- `isEmpty()` - Check if empty
- `clear()` - Remove all elements
- `toArray()` - Convert to sorted array
- `toString()` - String representation

#### **Example:**
```java
public class TreeSetExample {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<Integer>();
        
        // Adding elements (not in order)
        set.add(30);
        set.add(10);
        set.add(50);
        set.add(20);
        set.add(10); // Duplicate
        System.out.println("TreeSet: " + set.toString()); // {10, 20, 30, 50}
        
        // First and last elements
        System.out.println("First: " + set.first()); // 10
        System.out.println("Last: " + set.last()); // 50
        
        // Checking properties
        System.out.println("Size: " + set.size()); // 4
        System.out.println("Contains 20: " + set.contains(20)); // true
        System.out.println("Contains 60: " + set.contains(60)); // false
        
        // Removing elements
        set.remove(30);
        System.out.println("After remove: " + set.toString()); // {10, 20, 50}
        
        // Converting to array
        System.out.println("Array: " + set.toArray().toString()); // [10, 20, 50]
        
        // String TreeSet
        TreeSet<String> stringSet = new TreeSet<String>();
        stringSet.add("zebra");
        stringSet.add("apple");
        stringSet.add("banana");
        System.out.println("String TreeSet: " + stringSet.toString()); // {apple, banana, zebra}
    }
}
```

### 9. **TreeMap**
Sorted map implementation using red-black tree.

#### **Methods:**
- `put(key, value)` - Add/update key-value pair
- `get(key)` - Get value for key
- `containsKey(key)` - Check if key exists
- `containsValue(value)` - Check if value exists
- `remove(key)` - Remove key-value pair
- `firstKey()` - Get first (smallest) key
- `lastKey()` - Get last (largest) key
- `size()` - Get number of pairs
- `isEmpty()` - Check if empty
- `clear()` - Remove all pairs
- `keySet()` - Get all keys (sorted)
- `values()` - Get all values
- `entrySet()` - Get all key-value pairs
- `toString()` - String representation

#### **Example:**
```java
public class TreeMapExample {
    public static void main(String[] args) {
        TreeMap<String, Integer> map = new TreeMap<String, Integer>();
        
        // Adding key-value pairs (not in order)
        map.put("zebra", 5);
        map.put("apple", 3);
        map.put("banana", 8);
        map.put("cherry", 2);
        System.out.println("TreeMap: " + map.toString()); // {apple=3, banana=8, cherry=2, zebra=5}
        
        // First and last keys
        System.out.println("First key: " + map.firstKey()); // apple
        System.out.println("Last key: " + map.lastKey()); // zebra
        
        // Accessing values
        System.out.println("Value for banana: " + map.get("banana")); // 8
        System.out.println("Value for grape: " + map.get("grape")); // null
        
        // Checking existence
        System.out.println("Has apple: " + map.containsKey("apple")); // true
        System.out.println("Has value 8: " + map.containsValue(8)); // true
        
        // Removing entries
        map.remove("cherry");
        System.out.println("After remove: " + map.toString()); // {apple=3, banana=8, zebra=5}
        
        // Getting collections (sorted)
        System.out.println("Keys: " + map.keySet().toString()); // [apple, banana, zebra]
        System.out.println("Values: " + map.values().toString()); // [3, 8, 5]
        System.out.println("Entry set: " + map.entrySet().toString()); // [[apple, 3], [banana, 8], [zebra, 5]]
        
        // Numeric TreeMap
        TreeMap<Integer, String> numMap = new TreeMap<Integer, String>();
        numMap.put(30, "thirty");
        numMap.put(10, "ten");
        numMap.put(50, "fifty");
        System.out.println("Numeric TreeMap: " + numMap.toString()); // {10=ten, 30=thirty, 50=fifty}
    }
}
```

## 🔧 Advanced Usage Patterns

### **Nested Data Structures**
```java
public class NestedStructures {
    public static void main(String[] args) {
        // ArrayList of ArrayLists (Matrix)
        ArrayList<ArrayList<Integer>> matrix = new ArrayList<ArrayList<Integer>>();
        ArrayList<Integer> row1 = new ArrayList<Integer>();
        row1.add(1); row1.add(2); row1.add(3);
        ArrayList<Integer> row2 = new ArrayList<Integer>();
        row2.add(4); row2.add(5); row2.add(6);
        matrix.add(row1);
        matrix.add(row2);
        System.out.println("Matrix: " + matrix.toString());
        
        // HashMap with ArrayList values
        HashMap<String, ArrayList<String>> groups = new HashMap<String, ArrayList<String>>();
        ArrayList<String> fruits = new ArrayList<String>();
        fruits.add("apple"); fruits.add("banana");
        ArrayList<String> colors = new ArrayList<String>();
        colors.add("red"); colors.add("blue");
        groups.put("fruits", fruits);
        groups.put("colors", colors);
        System.out.println("Groups: " + groups.toString());
        
        // Stack of HashMaps
        Stack<HashMap<String, Integer>> stack = new Stack<HashMap<String, Integer>>();
        HashMap<String, Integer> map1 = new HashMap<String, Integer>();
        map1.put("a", 1); map1.put("b", 2);
        HashMap<String, Integer> map2 = new HashMap<String, Integer>();
        map2.put("c", 3); map2.put("d", 4);
        stack.push(map1);
        stack.push(map2);
        System.out.println("Stack of maps: " + stack.toString());
    }
}
```

### **Algorithmic Patterns**
```java
public class AlgorithmicPatterns {
    public static void main(String[] args) {
        // Two Sum using HashMap
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        HashMap<Integer, Integer> map = new HashMap<Integer, Integer>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                System.out.println("Two Sum: [" + map.get(complement) + ", " + i + "]");
                break;
            }
            map.put(nums[i], i);
        }
        
        // BFS using Queue
        Queue<String> queue = new Queue<String>();
        queue.offer("start");
        queue.offer("middle");
        queue.offer("end");
        
        System.out.println("BFS traversal:");
        while (!queue.isEmpty()) {
            String current = queue.poll();
            System.out.println("Visiting: " + current);
        }
        
        // DFS using Stack
        Stack<String> stack = new Stack<String>();
        stack.push("start");
        stack.push("middle");
        stack.push("end");
        
        System.out.println("DFS traversal:");
        while (!stack.isEmpty()) {
            String current = stack.pop();
            System.out.println("Visiting: " + current);
        }
        
        // Top K elements using PriorityQueue
        PriorityQueue<Integer> pq = new PriorityQueue<Integer>();
        int[] elements = {3, 1, 4, 1, 5, 9, 2, 6};
        int k = 3;
        
        for (int num : elements) {
            pq.offer(num);
            if (pq.size() > k) {
                pq.poll();
            }
        }
        
        System.out.println("Top " + k + " elements:");
        while (!pq.isEmpty()) {
            System.out.println(pq.poll());
        }
    }
}
```

## 🎯 Performance Characteristics

| Data Structure | Access | Search | Insertion | Deletion | Space |
|----------------|--------|--------|-----------|----------|-------|
| **ArrayList** | O(1) | O(n) | O(1) amortized | O(n) | O(n) |
| **HashMap** | O(1) | O(1) | O(1) | O(1) | O(n) |
| **HashSet** | N/A | O(1) | O(1) | O(1) | O(n) |
| **LinkedList** | O(n) | O(n) | O(1) | O(1) | O(n) |
| **Stack** | O(1) | O(n) | O(1) | O(1) | O(n) |
| **Queue** | O(1) | O(n) | O(1) | O(1) | O(n) |
| **PriorityQueue** | O(1) | O(n) | O(log n) | O(log n) | O(n) |
| **TreeSet** | N/A | O(log n) | O(log n) | O(log n) | O(n) |
| **TreeMap** | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |

## 🚀 Best Practices

### **1. Choose the Right Data Structure**
- Use **ArrayList** for random access and frequent indexing
- Use **HashMap** for key-value lookups and caching
- Use **HashSet** for unique element storage and set operations
- Use **LinkedList** for frequent insertions/deletions at beginning/end
- Use **Stack** for LIFO operations (parsing, backtracking)
- Use **Queue** for FIFO operations (BFS, task scheduling)
- Use **PriorityQueue** for priority-based processing
- Use **TreeSet/TreeMap** when you need sorted order

### **2. Memory Management**
- Clear data structures when no longer needed
- Use appropriate initial capacity for large collections
- Be aware of memory overhead for nested structures

### **3. Error Handling**
- Check bounds before accessing ArrayList/LinkedList by index
- Handle empty collections before calling peek/pop operations
- Use contains() before removing elements

### **4. Generic Types**
- Always specify generic types for type safety
- Use `ArrayList<Integer>` instead of raw `ArrayList`
- Leverage type inference where possible

## 🧪 Testing

Visit `/test-data-structures` to run comprehensive tests for all data structures and their methods.

## 📚 Common Use Cases

### **Competitive Programming**
- **Two Sum**: HashMap for O(1) lookups
- **Valid Parentheses**: Stack for matching
- **BFS/DFS**: Queue/Stack for traversal
- **Top K Elements**: PriorityQueue for sorting
- **Frequency Count**: HashMap for counting

### **Real-World Applications**
- **Caching**: HashMap for key-value storage
- **Task Scheduling**: PriorityQueue for priority-based processing
- **Undo Operations**: Stack for command history
- **Message Queues**: Queue for FIFO processing
- **Database Indexing**: TreeMap for sorted key access

---

**The Enhanced Java Runtime provides full data structure support for educational, competitive programming, and real-world applications.**

