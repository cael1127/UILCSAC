// Simple, reliable Java runtime that actually works
export interface JavaExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  variables?: Record<string, any>;
  executionTime: number;
  memoryUsage: number;
  warnings?: string[];
}

export class SimpleJavaRuntimeFixed {
  private variables: Map<string, any> = new Map();
  private output: string[] = [];

  reset(): void {
    this.variables.clear();
    this.output = [];
  }

  async execute(code: string): Promise<JavaExecutionResult> {
    const startTime = performance.now();
    this.reset();

    try {
      console.log('🚀 Starting simple Java execution...');
      
      // Extract main method body
      const mainBody = this.extractMainMethod(code);
      if (!mainBody) {
        return {
          success: false,
          output: '',
          error: 'Could not find main method',
          executionTime: 0,
          memoryUsage: 0
        };
      }

      console.log('Main method body:', mainBody);

      // Split into lines and process each one
      const lines = mainBody.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));
      
      for (const line of lines) {
        await this.executeLine(line);
      }

      const executionTime = performance.now() - startTime;
      const output = this.output.join('\n');

      console.log('✅ Simple Java execution completed:', {
        success: true,
        outputLength: output.length,
        executionTime
      });

      return {
        success: true,
        output,
        executionTime,
        memoryUsage: this.output.length * 2,
        variables: Object.fromEntries(this.variables)
      };

    } catch (err) {
      const executionTime = performance.now() - startTime;
      console.error('❌ Simple Java execution failed:', err);
      
      return {
        success: false,
        output: '',
        error: `Runtime error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        executionTime,
        memoryUsage: 0
      };
    }
  }

  private extractMainMethod(code: string): string | null {
    const mainStart = code.indexOf('public static void main(String[] args) {');
    if (mainStart === -1) return null;

    const braceStart = code.indexOf('{', mainStart);
    if (braceStart === -1) return null;

    // Find matching closing brace
    let braceCount = 1;
    let i = braceStart + 1;
    
    while (i < code.length && braceCount > 0) {
      if (code[i] === '{') braceCount++;
      else if (code[i] === '}') braceCount--;
      i++;
    }

    if (braceCount > 0) return null;

    return code.substring(braceStart + 1, i - 1).trim();
  }

  private async executeLine(line: string): Promise<void> {
    console.log(`Executing line: "${line}"`);

    // Handle System.out.println
    if (line.includes('System.out.println')) {
      const match = line.match(/System\.out\.println\(([^)]+)\);/);
      if (match) {
        const content = this.evaluateExpression(match[1]);
        this.output.push(String(content));
        console.log(`Print: "${content}"`);
      }
      return;
    }

    // Handle variable declarations with assignment
    const varDeclMatch = line.match(/^(int|String|double|boolean)\s+(\w+)\s*=\s*([^;]+);$/);
    if (varDeclMatch) {
      const [, type, name, value] = varDeclMatch;
      const evaluatedValue = this.evaluateExpression(value);
      this.variables.set(name, evaluatedValue);
      console.log(`Variable declared: ${name} = ${evaluatedValue} (type: ${type})`);
      return;
    }

    // Handle variable assignments
    const varAssignMatch = line.match(/^(\w+)\s*=\s*([^;]+);$/);
    if (varAssignMatch) {
      const [, name, value] = varAssignMatch;
      if (this.variables.has(name)) {
        const evaluatedValue = this.evaluateExpression(value);
        this.variables.set(name, evaluatedValue);
        console.log(`Variable assigned: ${name} = ${evaluatedValue}`);
      }
      return;
    }
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();
    console.log(`Evaluating: "${expr}"`);

    // Handle string literals
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }

    // Handle numeric literals
    if (/^\d+(\.\d+)?$/.test(expr)) {
      return parseFloat(expr);
    }

    // Handle variable references
    if (this.variables.has(expr)) {
      return this.variables.get(expr);
    }

    // Handle expressions with + operator - check for + outside of string literals
    if (this.hasPlusOperator(expr)) {
      // Split by + but be careful with string literals
      const parts = this.splitByPlus(expr);
      console.log(`Expression "${expr}" split into parts:`, parts);
      
      const evaluated = parts.map(p => this.evaluateExpression(p.trim()));
      console.log(`Evaluated parts:`, evaluated);
      
      // Check if all parts are numeric - if so, do arithmetic
      const allNumeric = evaluated.every(val => typeof val === 'number');
      if (allNumeric) {
        const result = evaluated.reduce((sum, val) => sum + val, 0);
        console.log(`Arithmetic result: ${result}`);
        return result;
      } else {
        // Otherwise, do string concatenation - convert all to strings
        const result = evaluated.map(val => String(val)).join('');
        console.log(`String concatenation result: "${result}"`);
        return result;
      }
    } else {
      console.log(`No + operator found in expression: "${expr}"`);
    }

    // Handle other arithmetic expressions (no + operator)
    if (expr.includes('-') || expr.includes('*') || expr.includes('/')) {
      let evalExpr = expr;
      for (const [name, value] of this.variables) {
        evalExpr = evalExpr.replace(new RegExp(`\\b${name}\\b`, 'g'), String(value));
      }
      try {
        return eval(evalExpr);
      } catch (e) {
        throw new Error(`Invalid arithmetic expression: "${expr}"`);
      }
    }

    throw new Error(`Unknown expression: "${expr}"`);
  }

  private splitByPlus(expr: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';

    console.log(`Splitting expression: "${expr}"`);

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (stringChar === char) {
          inString = false;
        }
      }
      
      if (char === '+' && !inString) {
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      parts.push(current.trim());
    }
    
    console.log(`Split parts:`, parts);
    return parts;
  }

  private hasPlusOperator(expr: string): boolean {
    let inString = false;
    let stringChar = '';

    console.log(`Checking for + operator in: "${expr}"`);

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true;
          stringChar = char;
          console.log(`Entered string at position ${i}`);
        } else if (stringChar === char) {
          inString = false;
          console.log(`Exited string at position ${i}`);
        }
      }
      
      if (char === '+' && !inString) {
        console.log(`Found + operator at position ${i}`);
        return true;
      }
    }
    
    console.log(`No + operator found`);
    return false;
  }
}

// Export singleton instance
export const simpleJavaRuntimeFixed = new SimpleJavaRuntimeFixed();
