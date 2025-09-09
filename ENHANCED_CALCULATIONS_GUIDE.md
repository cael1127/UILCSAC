# Enhanced Java Calculations Guide

## Overview

The UIL CS Academy IDE now features an **Enhanced Java Runtime** that supports complex mathematical calculations, proper operator precedence, parentheses, and comprehensive Math function support. This guide explains the new capabilities and how to use them.

## 🚀 New Features

### 1. **Operator Precedence Support**
The enhanced runtime now correctly handles operator precedence in mathematical expressions:

```java
public class OperatorPrecedence {
    public static void main(String[] args) {
        int a = 10, b = 5, c = 2;
        
        // Correct precedence: multiplication before addition
        int result1 = a + b * c;  // = 10 + (5 * 2) = 20
        
        // Parentheses override precedence
        int result2 = (a + b) * c;  // = (10 + 5) * 2 = 30
        
        System.out.println("a + b * c = " + result1);
        System.out.println("(a + b) * c = " + result2);
    }
}
```

### 2. **Parentheses Support**
Complex nested expressions with parentheses are now fully supported:

```java
public class Parentheses {
    public static void main(String[] args) {
        double result = ((10 + 5) * 2 - 3) / 4.0;
        System.out.println("((10 + 5) * 2 - 3) / 4.0 = " + result);
        
        // Nested parentheses
        double complex = Math.sqrt((Math.pow(3, 2) + Math.pow(4, 2)) * 2);
        System.out.println("sqrt((3² + 4²) * 2) = " + complex);
    }
}
```

### 3. **Comprehensive Math Functions**
All standard Java Math functions are now supported:

#### **Basic Math Functions**
```java
public class BasicMath {
    public static void main(String[] args) {
        double x = 16.0;
        
        // Square root
        System.out.println("sqrt(16) = " + Math.sqrt(x));
        
        // Power
        System.out.println("2^3 = " + Math.pow(2, 3));
        
        // Absolute value
        System.out.println("abs(-15.5) = " + Math.abs(-15.5));
        
        // Min/Max
        System.out.println("max(10, 5) = " + Math.max(10, 5));
        System.out.println("min(10, 5) = " + Math.min(10, 5));
    }
}
```

#### **Trigonometric Functions**
```java
public class Trigonometry {
    public static void main(String[] args) {
        double angle = Math.PI / 4; // 45 degrees
        
        System.out.println("sin(π/4) = " + Math.sin(angle));
        System.out.println("cos(π/4) = " + Math.cos(angle));
        System.out.println("tan(π/4) = " + Math.tan(angle));
        
        // Pythagorean identity
        double identity = Math.pow(Math.sin(angle), 2) + Math.pow(Math.cos(angle), 2);
        System.out.println("sin²(π/4) + cos²(π/4) = " + identity);
    }
}
```

#### **Logarithmic Functions**
```java
public class Logarithms {
    public static void main(String[] args) {
        // Natural logarithm
        System.out.println("ln(e) = " + Math.log(Math.E));
        System.out.println("ln(10) = " + Math.log(10));
        
        // Base-10 logarithm
        System.out.println("log₁₀(100) = " + Math.log10(100));
        
        // Exponential function
        System.out.println("e¹ = " + Math.exp(1));
    }
}
```

#### **Rounding Functions**
```java
public class Rounding {
    public static void main(String[] args) {
        double num = 3.7;
        
        System.out.println("round(3.7) = " + Math.round(num));
        System.out.println("floor(3.7) = " + Math.floor(num));
        System.out.println("ceil(3.7) = " + Math.ceil(num));
    }
}
```

### 4. **Mathematical Constants**
Standard mathematical constants are available:

```java
public class Constants {
    public static void main(String[] args) {
        System.out.println("π = " + Math.PI);
        System.out.println("e = " + Math.E);
        
        // Use in calculations
        double circumference = 2 * Math.PI * 5; // Circle with radius 5
        System.out.println("Circumference = " + circumference);
    }
}
```

### 5. **Complex Mathematical Expressions**
The enhanced runtime can handle sophisticated mathematical expressions:

```java
public class ComplexMath {
    public static void main(String[] args) {
        // Quadratic formula: x = (-b ± sqrt(b² - 4ac)) / 2a
        double a = 1.0, b = -5.0, c = 6.0;
        double discriminant = Math.pow(b, 2) - 4 * a * c;
        
        if (discriminant >= 0) {
            double x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            double x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            System.out.println("Roots: x1 = " + x1 + ", x2 = " + x2);
        }
        
        // Distance formula
        double distance = Math.sqrt(Math.pow(3, 2) + Math.pow(4, 2));
        System.out.println("Distance from (0,0) to (3,4) = " + distance);
        
        // Compound interest
        double principal = 1000.0;
        double rate = 0.05;
        double time = 2.0;
        double amount = principal * Math.pow(1 + rate, time);
        System.out.println("Compound amount = $" + amount);
    }
}
```

## 🧪 Testing the Enhanced Runtime

### Test Page
Visit `/test-enhanced-calculations` to try out the enhanced calculation capabilities with pre-built examples.

### Example Test Cases
The enhanced runtime includes several test categories:

1. **Basic Arithmetic** - Operator precedence and parentheses
2. **Math Functions** - All standard Math class functions
3. **Trigonometry** - Sin, cos, tan functions
4. **Logarithms** - Natural and base-10 logarithms
5. **Complex Expressions** - Advanced mathematical formulas
6. **Custom Calculations** - Your own mathematical problems

## 🔧 Technical Implementation

### Enhanced Expression Evaluator
The new runtime includes:

- **Operator Precedence Parser**: Correctly handles `^`, `*`, `/`, `%`, `+`, `-` in proper order
- **Parentheses Handler**: Recursively evaluates nested expressions
- **Math Function Parser**: Supports all `Math.*` function calls
- **Safe Evaluation**: Prevents infinite loops and handles edge cases

### Performance Improvements
- **Optimized Parsing**: Faster expression evaluation
- **Memory Management**: Better variable tracking and cleanup
- **Error Handling**: More descriptive error messages

## 📚 Usage Examples

### For Students
```java
// Calculate the area of a circle
double radius = 5.0;
double area = Math.PI * Math.pow(radius, 2);
System.out.println("Area = " + area);

// Solve quadratic equations
double a = 1, b = -3, c = 2;
double x = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a);
System.out.println("Solution: x = " + x);
```

### For Competitive Programming
```java
// Calculate combinations: C(n,r) = n! / (r! * (n-r)!)
public static long combination(int n, int r) {
    if (r > n) return 0;
    if (r == 0 || r == n) return 1;
    
    long result = 1;
    for (int i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1);
    }
    return result;
}
```

### For Mathematical Problems
```java
// Calculate the greatest common divisor using Euclidean algorithm
public static int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return Math.abs(a);
}
```

## 🎯 Benefits

1. **Educational Value**: Students can now solve complex mathematical problems
2. **Competitive Programming**: Full support for algorithmic calculations
3. **Real-world Applications**: Physics, engineering, and scientific calculations
4. **Better Learning**: Proper operator precedence understanding
5. **Comprehensive Testing**: Extensive test cases for validation

## 🚀 Getting Started

1. **Open the IDE**: Use any of the Java IDE components
2. **Try Examples**: Start with the basic arithmetic examples
3. **Experiment**: Create your own mathematical expressions
4. **Test Complex Cases**: Try the advanced examples in the test page
5. **Build Solutions**: Use the enhanced capabilities for your problems

## 🔍 Troubleshooting

### Common Issues
- **Parentheses Mismatch**: Ensure all parentheses are properly closed
- **Math Function Syntax**: Use `Math.functionName()` format
- **Variable Types**: Be aware of int vs double precision
- **Division by Zero**: Check for zero denominators

### Error Messages
The enhanced runtime provides detailed error messages:
- `Unmatched parentheses: 3 opening, 2 closing`
- `Unknown Math function: sqrt2`
- `Invalid expression: "a + b *"`

## 📈 Future Enhancements

Planned improvements include:
- **Custom Function Support**: Define your own mathematical functions
- **Matrix Operations**: Support for matrix calculations
- **Statistical Functions**: Mean, median, standard deviation
- **Graphing Support**: Visual representation of mathematical functions
- **Unit Testing**: Built-in test framework for mathematical functions

---

**The Enhanced Java Runtime makes complex mathematical calculations accessible and educational for all users of the UIL CS Academy IDE.**

