// Enhanced Java Runtime with Advanced Mathematical Expression Support
// This runtime can handle complex calculations, operator precedence, parentheses, and Math functions

export interface JavaExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  variables?: Record<string, any>;
  executionTime: number;
  memoryUsage: number;
  warnings?: string[];
}

export interface JavaVariable {
  name: string;
  type: string;
  value: any;
}

export class EnhancedJavaRuntime {
  private variables: Map<string, JavaVariable> = new Map();
  private output: string[] = [];
  private error: string | null = null;
  private warnings: string[] = [];
  private startTime: number = 0;
  private memoryUsage: number = 0;

  reset(): void {
    this.variables.clear();
    this.output = [];
    this.error = null;
    this.warnings = [];
    this.startTime = 0;
    this.memoryUsage = 0;
  }

  async execute(code: string): Promise<JavaExecutionResult> {
    this.startTime = performance.now();
    this.reset();

    try {
      console.log('🚀 Starting Enhanced Java execution...');
      console.log('Code length:', code.length);

      // Basic validation
      const validationResult = this.validateJavaCode(code);
      if (!validationResult.isValid) {
        return {
          success: false,
          output: '',
          error: validationResult.error,
          executionTime: 0,
          memoryUsage: 0,
          warnings: []
        };
      }

      // Execute the code
      const result = await this.executeJavaCode(code);
      const executionTime = performance.now() - this.startTime;

      console.log('✅ Enhanced Java execution completed:', {
        success: result.success,
        outputLength: result.output?.length || 0,
        executionTime,
        hasError: !!result.error
      });

      return {
        success: result.success,
        output: result.output,
        error: result.error,
        variables: result.variables,
        executionTime,
        memoryUsage: this.memoryUsage,
        warnings: this.warnings
      };
    } catch (err) {
      const executionTime = performance.now() - this.startTime;
      console.error('❌ Enhanced Java execution failed:', err);
      
      return {
        success: false,
        output: '',
        error: `Runtime error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variables: {},
        executionTime,
        memoryUsage: this.memoryUsage,
        warnings: this.warnings
      };
    }
  }

  private validateJavaCode(code: string): { isValid: boolean; error?: string } {
    const trimmedCode = code.trim();
    
    if (!trimmedCode.includes('class')) {
      return { isValid: false, error: 'Java code must contain a class declaration' };
    }
    
    if (!trimmedCode.includes('main')) {
      return { isValid: false, error: 'Java code must contain a main method' };
    }
    
    // Check for balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      return { isValid: false, error: `Unmatched braces: ${openBraces} opening, ${closeBraces} closing` };
    }
    
    return { isValid: true };
  }

  private async executeJavaCode(code: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
    variables?: Record<string, any>;
  }> {
    try {
      // Extract main method content
      const mainStart = code.indexOf('public static void main(String[] args) {');
      if (mainStart === -1) {
        return { 
          success: false, 
          output: '', 
          error: 'Could not find main method. Please ensure you have: public static void main(String[] args) { ... }' 
        };
      }
      
      const braceStart = code.indexOf('{', mainStart);
      if (braceStart === -1) {
        return { 
          success: false, 
          output: '', 
          error: 'Could not find opening brace for main method' 
        };
      }
      
      // Find matching closing brace
      let braceCount = 1;
      let i = braceStart + 1;
      let inString = false;
      let stringChar = '';
      
      while (i < code.length && braceCount > 0) {
        const char = code[i];
        
        if (char === '"' || char === "'") {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (stringChar === char) {
            inString = false;
          }
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
        }
        
        i++;
      }
      
      if (braceCount > 0) {
        return { 
          success: false, 
          output: '', 
          error: 'Could not find matching closing brace for main method' 
        };
      }
      
      const mainBody = code.substring(braceStart + 1, i - 1);
      console.log('Main method body:', mainBody);
      return this.executeMainMethod(mainBody);
    } catch (err) {
      return {
        success: false,
        output: '',
        error: `Execution error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variables: {}
      };
    }
  }

  private async executeMainMethod(mainBody: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
    variables?: Record<string, any>;
  }> {
    try {
      const statements = this.parseStatements(mainBody);
      console.log('Parsed statements:', statements);
      
      for (const stmt of statements) {
        if (this.error) break;
        await this.executeStatement(stmt);
      }

      const output = this.formatOutput();
      
      return {
        success: this.error === null,
        output,
        error: this.error || undefined,
        variables: this.getVariablesMap()
      };
    } catch (err) {
      return {
        success: false,
        output: '',
        error: `Main method execution error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variables: {}
      };
    }
  }

  private parseStatements(code: string): string[] {
    const statements: string[] = [];
    let current = '';
    let braceLevel = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      
      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (stringChar === char) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '{') braceLevel++;
        if (char === '}') braceLevel--;
        
        if (char === ';' && braceLevel === 0) {
          current += char;
          const trimmed = current.trim();
          if (trimmed && !trimmed.startsWith('//')) {
            statements.push(trimmed);
          }
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith('//')) {
        statements.push(trimmed);
      }
    }
    
    return statements;
  }

  private async executeStatement(stmt: string): Promise<void> {
    const trimmed = stmt.trim();
    console.log(`Executing: "${trimmed}"`);
    
    try {
      if (trimmed.includes('System.out.println') || trimmed.includes('System.out.print')) {
        this.handlePrint(trimmed);
      } else if (trimmed.match(/^(int|String|double|boolean|char|ArrayList|HashMap|HashSet|LinkedList|Stack|Queue|PriorityQueue|TreeSet|TreeMap|Scanner)\s+\w+/) || 
                 trimmed.match(/^(int|String|double|boolean|char|ArrayList|HashMap|HashSet|LinkedList|Stack|Queue|PriorityQueue|TreeSet|TreeMap|Scanner)<[^>]*>\s+\w+/) ||
                 (trimmed.includes('=') && trimmed.match(/^\w+\s+\w+/))) {
        this.handleDeclaration(trimmed);
      } else if (trimmed.includes('=') && !trimmed.includes('==')) {
        this.handleAssignment(trimmed);
      } else if (trimmed.includes('import')) {
        return;
      } else if (trimmed.includes('class') || trimmed.includes('public class')) {
        return;
      } else if (trimmed.includes('throws')) {
        return;
      } else if (trimmed === '}' || trimmed === '{') {
        return;
      } else if (trimmed.includes('(') && trimmed.includes(')') && trimmed.includes('.')) {
        // Handle method calls (e.g., list.add(10), map.put("key", value))
        this.evaluateExpression(trimmed.replace(';', ''));
      } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        this.evaluateExpression(trimmed);
      }
    } catch (err) {
      console.error(`Error executing statement "${trimmed}":`, err);
      this.error = `Error in statement "${trimmed}": ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  }

  private handlePrint(stmt: string): void {
    // Find the opening parenthesis after System.out.println/print
    const printStart = stmt.indexOf('System.out.');
    if (printStart === -1) return;
    
    const parenStart = stmt.indexOf('(', printStart);
    if (parenStart === -1) return;
    
    // Find the matching closing parenthesis
    let parenCount = 0;
    let contentEnd = -1;
    for (let i = parenStart; i < stmt.length; i++) {
      if (stmt[i] === '(') parenCount++;
      if (stmt[i] === ')') parenCount--;
      if (parenCount === 0) {
        contentEnd = i;
        break;
      }
    }
    
    if (contentEnd === -1) return;
    
    const method = stmt.includes('println') ? 'println' : 'print';
    let content = stmt.substring(parenStart + 1, contentEnd).trim();
    
    try {
      // Handle empty print statements
      if (!content) {
        this.output.push('');
        return;
      }
      
      let evaluatedContent: any;
      
      // Handle string concatenation with method calls
      if (content.includes('+')) {
        evaluatedContent = this.evaluateStringConcatenation(content);
      } else {
        // Handle single expressions (including method calls)
        evaluatedContent = this.evaluateExpression(content);
      }
      
      this.output.push(String(evaluatedContent));
      this.memoryUsage += String(evaluatedContent).length * 2;
    } catch (error) {
      console.error(`Print error: ${error}`);
      this.output.push(`[Print Error: ${error}]`);
    }
  }

  private evaluateStringConcatenation(expr: string): string {
    // Handle string concatenation like "Hello " + name + "!"
    const parts = this.splitStringConcatenation(expr);
    let result = '';
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        // String literal
        result += trimmed.slice(1, -1);
      } else {
        // Expression (variable, method call, etc.)
        const evaluated = this.evaluateExpression(trimmed);
        result += String(evaluated);
      }
    }
    
    return result;
  }

  private splitStringConcatenation(expr: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let parenCount = 0;
    let bracketCount = 0;
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          parenCount++;
        } else if (char === ')') {
          parenCount--;
        } else if (char === '[') {
          bracketCount++;
        } else if (char === ']') {
          bracketCount--;
        } else if (char === '+' && parenCount === 0 && bracketCount === 0) {
          // Found a top-level + operator
          parts.push(current.trim());
          current = '';
          continue;
        }
      } else {
        if (char === stringChar) {
          inString = false;
        }
      }
      
      current += char;
    }
    
    // Add the last part
    if (current.trim()) {
      parts.push(current.trim());
    }
    
    return parts;
  }

  private handleDeclaration(stmt: string): void {
    // Remove semicolon if present
    stmt = stmt.replace(/;$/, '');
    
    // Handle generic types like ArrayList<String>, HashMap<Integer, String>
    const genericMatch = stmt.match(/^(\w+<[^>]*>)\s+(.+)/);
    if (genericMatch) {
      const type = genericMatch[1];
      const declarations = genericMatch[2];
      
      // Parse multiple declarations for generic types
      const varDeclarations = this.parseMultipleDeclarations(declarations);
      
      for (const declaration of varDeclarations) {
        const { name, value } = declaration;
        let finalValue: any = null;
        
        if (value !== null) {
          finalValue = this.evaluateExpression(value);
        } else {
          // Create default value based on generic type
          if (type.startsWith('ArrayList')) {
            finalValue = this.createArrayList();
          } else if (type.startsWith('HashMap')) {
            finalValue = this.createHashMap();
          } else if (type.startsWith('HashSet')) {
            finalValue = this.createHashSet();
          } else if (type.startsWith('LinkedList')) {
            finalValue = this.createLinkedList();
          } else if (type.startsWith('Stack')) {
            finalValue = this.createStack();
          } else if (type.startsWith('Queue')) {
            finalValue = this.createQueue();
          } else if (type.startsWith('PriorityQueue')) {
            finalValue = this.createPriorityQueue();
          } else if (type.startsWith('TreeSet')) {
            finalValue = this.createTreeSet();
          } else if (type.startsWith('TreeMap')) {
            finalValue = this.createTreeMap();
          }
        }
        
        this.variables.set(name, { name, type, value: finalValue });
        this.memoryUsage += this.estimateMemoryUsage(finalValue);
        console.log(`Generic variable declared: ${name} = ${finalValue} (type: ${type})`);
      }
      return;
    }
    
    // Handle non-generic types
    const parts = stmt.split(/\s+/);
    if (parts.length >= 2) {
      const type = parts[0];
      const declarations = parts.slice(1).join(' ');
      
      // Parse multiple declarations for non-generic types
      const varDeclarations = this.parseMultipleDeclarations(declarations);
      
      for (const declaration of varDeclarations) {
        const { name, value } = declaration;
        let finalValue: any = null;
        
        if (value !== null) {
          finalValue = this.evaluateExpression(value);
          finalValue = this.convertValue(finalValue, type);
        } else {
          switch (type) {
            case 'int': finalValue = 0; break;
            case 'double': finalValue = 0.0; break;
            case 'boolean': finalValue = false; break;
            case 'String': finalValue = ''; break;
            case 'char': finalValue = '\0'; break;
            case 'ArrayList': finalValue = this.createArrayList(); break;
            case 'HashMap': finalValue = this.createHashMap(); break;
            case 'HashSet': finalValue = this.createHashSet(); break;
            case 'LinkedList': finalValue = this.createLinkedList(); break;
            case 'Stack': finalValue = this.createStack(); break;
            case 'Queue': finalValue = this.createQueue(); break;
            case 'PriorityQueue': finalValue = this.createPriorityQueue(); break;
            case 'TreeSet': finalValue = this.createTreeSet(); break;
            case 'TreeMap': finalValue = this.createTreeMap(); break;
          }
        }
        
        this.variables.set(name, { name, type, value: finalValue });
        this.memoryUsage += this.estimateMemoryUsage(finalValue);
        console.log(`Variable declared: ${name} = ${finalValue} (type: ${type})`);
      }
    }
  }

  private parseMultipleDeclarations(declarations: string): Array<{name: string, value: string | null}> {
    const result: Array<{name: string, value: string | null}> = [];
    
    // Split by comma, but be careful with commas inside expressions, generic types, and strings
    let current = '';
    let parenCount = 0;
    let bracketCount = 0;
    let angleCount = 0; // For generic types like HashMap<String, Integer>
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < declarations.length; i++) {
      const char = declarations[i];
      
      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          parenCount++;
        } else if (char === ')') {
          parenCount--;
        } else if (char === '[') {
          bracketCount++;
        } else if (char === ']') {
          bracketCount--;
        } else if (char === '<') {
          angleCount++;
        } else if (char === '>') {
          angleCount--;
        } else if (char === ',' && parenCount === 0 && bracketCount === 0 && angleCount === 0) {
          // Found a top-level comma (not inside parentheses, brackets, or angle brackets)
          result.push(this.parseSingleDeclaration(current.trim()));
          current = '';
          continue;
        }
      } else {
        if (char === stringChar) {
          inString = false;
        }
      }
      
      current += char;
    }
    
    // Add the last declaration
    if (current.trim()) {
      result.push(this.parseSingleDeclaration(current.trim()));
    }
    
    return result;
  }

  private parseSingleDeclaration(declaration: string): {name: string, value: string | null} {
    const equalIndex = declaration.indexOf('=');
    
    if (equalIndex === -1) {
      // No assignment, just variable name
      const name = declaration.trim();
      return { name, value: null };
    } else {
      // Has assignment
      const name = declaration.substring(0, equalIndex).trim();
      const value = declaration.substring(equalIndex + 1).trim();
      return { name, value };
    }
  }

  private handleAssignment(stmt: string): void {
    const [varPart, valuePart] = stmt.split('=').map(p => p.trim());
    const varName = varPart.replace(/[;,\s]/g, '');
    
    if (this.variables.has(varName)) {
      const variable = this.variables.get(varName)!;
      const value = this.evaluateExpression(valuePart.replace(';', ''));
      variable.value = this.convertValue(value, variable.type);
      this.memoryUsage += this.estimateMemoryUsage(value);
    }
  }

  // Enhanced expression evaluator with operator precedence and parentheses support
  private evaluateExpression(expr: string): any {
    expr = expr.trim();
    console.log(`Evaluating: "${expr}"`);
    
    try {
      // Handle string literals
      if (expr.startsWith('"') && expr.endsWith('"')) {
        return expr.slice(1, -1);
      }
      
      if (expr.startsWith("'") && expr.endsWith("'")) {
        return expr.slice(1, -1);
      }
      
      // Handle numeric literals
      if (/^\d+(\.\d+)?$/.test(expr)) {
        return parseFloat(expr);
      }
      
      // Handle boolean literals
      if (expr === 'true') return true;
      if (expr === 'false') return false;
      if (expr === 'null') return null;
      
      // Handle variable references
      if (this.variables.has(expr)) {
        return this.variables.get(expr)!.value;
      }
      
      // Handle Math function calls
      if (expr.startsWith('Math.')) {
        return this.evaluateMathFunction(expr);
      }
      
      // Handle new object creation
      if (expr.startsWith('new ')) {
        return this.evaluateNewExpression(expr);
      }
      
      // Handle method calls (e.g., list.add(10), map.get("key"))
      // Only treat as method call if it has a dot before the parentheses
      if (expr.includes('(') && expr.includes(')') && expr.includes('.')) {
        return this.evaluateMethodCall(expr);
      }
      
      // Handle complex expressions with operator precedence
      if (this.hasOperators(expr)) {
        return this.evaluateComplexExpression(expr);
      }
      
      throw new Error(`Unknown expression: "${expr}"`);
      
    } catch (error) {
      console.error(`Error evaluating expression "${expr}":`, error);
      throw error;
    }
  }

  // Check if expression contains any operators
  private hasOperators(expr: string): boolean {
    const operators = ['+', '-', '*', '/', '%', '^', '(', ')'];
    return operators.some(op => expr.includes(op));
  }

  // Evaluate Math function calls
  private evaluateMathFunction(expr: string): number {
    const mathFunctions: Record<string, (args: number[]) => number> = {
      'sqrt': (args) => Math.sqrt(args[0]),
      'pow': (args) => Math.pow(args[0], args[1]),
      'abs': (args) => Math.abs(args[0]),
      'max': (args) => Math.max(args[0], args[1]),
      'min': (args) => Math.min(args[0], args[1]),
      'round': (args) => Math.round(args[0]),
      'floor': (args) => Math.floor(args[0]),
      'ceil': (args) => Math.ceil(args[0]),
      'sin': (args) => Math.sin(args[0]),
      'cos': (args) => Math.cos(args[0]),
      'tan': (args) => Math.tan(args[0]),
      'log': (args) => Math.log(args[0]),
      'log10': (args) => Math.log10(args[0]),
      'exp': (args) => Math.exp(args[0]),
      'random': () => Math.random(),
      'PI': () => Math.PI,
      'E': () => Math.E
    };

    // Handle Math constants
    if (expr === 'Math.PI') return Math.PI;
    if (expr === 'Math.E') return Math.E;

    // Handle Math function calls
    const match = expr.match(/Math\.(\w+)\((.*)\)/);
    if (match) {
      const functionName = match[1];
      const argsStr = match[2];
      
      if (functionName === 'random') {
        return Math.random();
      }
      
      if (mathFunctions[functionName]) {
        const args = argsStr ? argsStr.split(',').map(arg => this.evaluateExpression(arg.trim())) : [];
        return mathFunctions[functionName](args);
      } else {
        throw new Error(`Unknown Math function: ${functionName}`);
      }
    }

    throw new Error(`Invalid Math expression: ${expr}`);
  }

  // Enhanced expression evaluator with proper operator precedence
  private evaluateComplexExpression(expr: string): any {
    console.log(`Evaluating complex expression: "${expr}"`);
    
    // Replace variable names with their values
    let processedExpr = expr;
    for (const [name, varInfo] of this.variables) {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      processedExpr = processedExpr.replace(regex, String(varInfo.value));
    }
    
    console.log(`Processed expression: "${processedExpr}"`);
    
    try {
      // Use a safe expression evaluator that handles operator precedence
      return this.safeEvaluate(processedExpr);
    } catch (error) {
      console.error(`Error in complex expression evaluation:`, error);
      throw new Error(`Invalid expression: "${expr}"`);
    }
  }

  // Safe expression evaluator with operator precedence
  private safeEvaluate(expr: string): any {
    // Remove whitespace
    expr = expr.replace(/\s/g, '');
    
    // Handle parentheses first
    while (expr.includes('(')) {
      const lastOpen = expr.lastIndexOf('(');
      const nextClose = expr.indexOf(')', lastOpen);
      
      if (nextClose === -1) {
        throw new Error('Unmatched parentheses');
      }
      
      const subExpr = expr.substring(lastOpen + 1, nextClose);
      const result = this.evaluateWithoutParentheses(subExpr);
      expr = expr.substring(0, lastOpen) + result + expr.substring(nextClose + 1);
    }
    
    return this.evaluateWithoutParentheses(expr);
  }

  // Evaluate expression without parentheses
  private evaluateWithoutParentheses(expr: string): any {
    // Handle string concatenation vs arithmetic
    if (expr.includes('+')) {
      const parts = this.splitByOperator(expr, '+');
      const evaluated = parts.map(part => this.evaluateWithoutParentheses(part));
      
      // Check if all parts are numeric
      const allNumeric = evaluated.every(val => typeof val === 'number' && !isNaN(val));
      if (allNumeric) {
        return evaluated.reduce((sum, val) => sum + val, 0);
      } else {
        // String concatenation
        return evaluated.map(val => String(val)).join('');
      }
    }
    
    // Handle other operators with proper precedence
    const operators = [
      { op: '^', precedence: 4, associativity: 'right' },
      { op: '*', precedence: 3, associativity: 'left' },
      { op: '/', precedence: 3, associativity: 'left' },
      { op: '%', precedence: 3, associativity: 'left' },
      { op: '-', precedence: 2, associativity: 'left' }
    ];
    
    for (const { op, precedence } of operators) {
      if (expr.includes(op)) {
        const parts = this.splitByOperator(expr, op);
        const evaluated = parts.map(part => this.evaluateWithoutParentheses(part));
        
        switch (op) {
          case '^': return Math.pow(evaluated[0], evaluated[1]);
          case '*': return evaluated.reduce((prod, val) => prod * val, 1);
          case '/': return evaluated.reduce((quot, val) => quot / val);
          case '%': return evaluated.reduce((mod, val) => mod % val);
          case '-': return evaluated.reduce((diff, val) => diff - val);
        }
      }
    }
    
    // Handle numeric literals
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return parseFloat(expr);
    }
    
    // Handle function calls
    if (expr.startsWith('Math.')) {
      return this.evaluateMathFunction(expr);
    }
    
    throw new Error(`Cannot evaluate: "${expr}"`);
  }

  // Split expression by operator while respecting precedence
  private splitByOperator(expr: string, operator: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (char === operator && depth === 0) {
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = '';
        continue;
      }
      
      current += char;
    }
    
    if (current.trim()) {
      parts.push(current.trim());
    }
    
    return parts;
  }

  private convertValue(value: any, targetType: string): any {
    switch (targetType) {
      case 'int': return parseInt(value) || 0;
      case 'double': return parseFloat(value) || 0.0;
      case 'boolean': return Boolean(value);
      case 'String': return String(value);
      case 'char': return String(value).charAt(0) || '\0';
      default: return value;
    }
  }

  private estimateMemoryUsage(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2;
    } else if (typeof value === 'number') {
      return 8;
    } else if (typeof value === 'boolean') {
      return 1;
    } else if (Array.isArray(value)) {
      return value.length * 8;
    }
    return 8;
  }

  private getVariablesMap(): Record<string, any> {
    const vars: Record<string, any> = {};
    for (const [name, varInfo] of this.variables) {
      vars[name] = varInfo.value;
    }
    return vars;
  }

  private formatOutput(): string {
    if (this.output.length === 0) {
      return 'No output produced. Make sure to use System.out.println() to print results.';
    }

    const outputText = this.output.join('\n').trim();
    
    if (!outputText) {
      return 'No output produced. Make sure to use System.out.println() to print results.';
    }

    return outputText;
  }

  // Handle new object creation expressions
  private evaluateNewExpression(expr: string): any {
    // Match new ClassName<...>() or new ClassName()
    const newMatch = expr.match(/new\s+(\w+)(?:<[^>]*>)?\s*\(\s*\)/);
    if (newMatch) {
      const className = newMatch[1];
      switch (className) {
        case 'ArrayList': return this.createArrayList();
        case 'HashMap': return this.createHashMap();
        case 'HashSet': return this.createHashSet();
        case 'LinkedList': return this.createLinkedList();
        case 'Stack': return this.createStack();
        case 'Queue': return this.createQueue();
        case 'PriorityQueue': return this.createPriorityQueue();
        case 'TreeSet': return this.createTreeSet();
        case 'TreeMap': return this.createTreeMap();
        case 'Scanner': return this.createScanner();
        default: throw new Error(`Unknown class: ${className}`);
      }
    }
    throw new Error(`Invalid new expression: ${expr}`);
  }

  private evaluateMethodCall(expr: string): any {
    // Parse method calls like list.add(10), map.get("key"), obj.method(arg1, arg2)
    const methodMatch = expr.match(/^(\w+)\.(\w+)\(([^)]*)\)$/);
    if (methodMatch) {
      const objectName = methodMatch[1];
      const methodName = methodMatch[2];
      const argsStr = methodMatch[3];
      
      // Get the object from variables
      if (!this.variables.has(objectName)) {
        throw new Error(`Variable '${objectName}' not found`);
      }
      
      const variable = this.variables.get(objectName)!;
      const obj = variable.value;
      
      // Parse arguments
      const args: any[] = [];
      if (argsStr.trim()) {
        // Split arguments by comma, but be careful with nested parentheses and strings
        const argParts = this.parseMethodArguments(argsStr);
        for (const arg of argParts) {
          args.push(this.evaluateExpression(arg.trim()));
        }
      }
      
      // Call the method
      if (typeof obj === 'object' && obj !== null && typeof obj[methodName] === 'function') {
        return obj[methodName](...args);
      } else {
        throw new Error(`Method '${methodName}' not found on object '${objectName}'`);
      }
    }
    
    throw new Error(`Invalid method call: ${expr}`);
  }

  private parseMethodArguments(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let parenCount = 0;
    let bracketCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      
      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === '(') {
          parenCount++;
        } else if (char === ')') {
          parenCount--;
        } else if (char === '[') {
          bracketCount++;
        } else if (char === ']') {
          bracketCount--;
        } else if (char === ',' && parenCount === 0 && bracketCount === 0) {
          // Found a top-level comma
          args.push(current.trim());
          current = '';
          continue;
        }
      } else {
        if (char === stringChar) {
          inString = false;
        }
      }
      
      current += char;
    }
    
    // Add the last argument
    if (current.trim()) {
      args.push(current.trim());
    }
    
    return args;
  }

  // Data Structure Implementations

  private createArrayList(): any {
    const list: any = [];
    
    list.add = (item: any) => {
      list.push(item);
      return true;
    };
    
    list.get = (index: number) => {
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for ArrayList of size ${list.length}`);
      }
      return list[index];
    };
    
    list.size = () => list.length;
    
    list.set = (index: number, item: any) => {
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for ArrayList of size ${list.length}`);
      }
      const oldItem = list[index];
      list[index] = item;
      return oldItem;
    };
    
    list.remove = (index: number) => {
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for ArrayList of size ${list.length}`);
      }
      return list.splice(index, 1)[0];
    };
    
    list.clear = () => { list.length = 0; };
    list.isEmpty = () => list.length === 0;
    list.contains = (item: any) => list.includes(item);
    list.indexOf = (item: any) => list.indexOf(item);
    list.toString = () => `[${list.join(', ')}]`;
    
    return list;
  }

  private createHashMap(): any {
    const map = new Map();
    
    return {
      put: (key: any, value: any) => {
        const oldValue = map.get(key);
        map.set(key, value);
        return oldValue;
      },
      get: (key: any) => map.get(key),
      containsKey: (key: any) => map.has(key),
      containsValue: (value: any) => Array.from(map.values()).includes(value),
      size: () => map.size,
      isEmpty: () => map.size === 0,
      clear: () => map.clear(),
      remove: (key: any) => {
        const oldValue = map.get(key);
        map.delete(key);
        return oldValue;
      },
      keySet: () => Array.from(map.keys()),
      values: () => Array.from(map.values()),
      entrySet: () => Array.from(map.entries()),
      toString: () => `{${Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join(', ')}}`
    };
  }

  private createHashSet(): any {
    const set = new Set();
    
    return {
      add: (item: any) => {
        const wasAdded = !set.has(item);
        set.add(item);
        return wasAdded;
      },
      contains: (item: any) => set.has(item),
      size: () => set.size,
      isEmpty: () => set.size === 0,
      clear: () => set.clear(),
      remove: (item: any) => set.delete(item),
      toArray: () => Array.from(set),
      toString: () => `{${Array.from(set).join(', ')}}`
    };
  }

  private createLinkedList(): any {
    const list: any = [];
    
    list.add = (item: any) => {
      list.push(item);
      return true;
    };
    
    list.addFirst = (item: any) => {
      list.unshift(item);
    };
    
    list.addLast = (item: any) => {
      list.push(item);
    };
    
    list.get = (index: number) => {
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for LinkedList of size ${list.length}`);
      }
      return list[index];
    };
    
    list.getFirst = () => {
      if (list.length === 0) throw new Error('LinkedList is empty');
      return list[0];
    };
    
    list.getLast = () => {
      if (list.length === 0) throw new Error('LinkedList is empty');
      return list[list.length - 1];
    };
    
    list.remove = (index: number) => {
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for LinkedList of size ${list.length}`);
      }
      return list.splice(index, 1)[0];
    };
    
    list.removeFirst = () => {
      if (list.length === 0) throw new Error('LinkedList is empty');
      return list.shift();
    };
    
    list.removeLast = () => {
      if (list.length === 0) throw new Error('LinkedList is empty');
      return list.pop();
    };
    
    list.size = () => list.length;
    list.isEmpty = () => list.length === 0;
    list.clear = () => { list.length = 0; };
    list.contains = (item: any) => list.includes(item);
    list.indexOf = (item: any) => list.indexOf(item);
    list.toString = () => `[${list.join(', ')}]`;
    
    return list;
  }

  private createStack(): any {
    const stack: any = [];
    
    stack.push = (item: any) => {
      stack.push(item);
      return item;
    };
    
    stack.pop = () => {
      if (stack.length === 0) throw new Error('Stack is empty');
      return stack.pop();
    };
    
    stack.peek = () => {
      if (stack.length === 0) throw new Error('Stack is empty');
      return stack[stack.length - 1];
    };
    
    stack.size = () => stack.length;
    stack.isEmpty = () => stack.length === 0;
    stack.clear = () => { stack.length = 0; };
    stack.contains = (item: any) => stack.includes(item);
    stack.toString = () => `[${stack.join(', ')}]`;
    
    return stack;
  }

  private createQueue(): any {
    const queue: any = [];
    
    queue.offer = (item: any) => {
      queue.push(item);
      return true;
    };
    
    queue.add = (item: any) => {
      queue.push(item);
      return true;
    };
    
    queue.poll = () => {
      if (queue.length === 0) return null;
      return queue.shift();
    };
    
    queue.remove = () => {
      if (queue.length === 0) throw new Error('Queue is empty');
      return queue.shift();
    };
    
    queue.peek = () => {
      if (queue.length === 0) return null;
      return queue[0];
    };
    
    queue.element = () => {
      if (queue.length === 0) throw new Error('Queue is empty');
      return queue[0];
    };
    
    queue.size = () => queue.length;
    queue.isEmpty = () => queue.length === 0;
    queue.clear = () => { queue.length = 0; };
    queue.contains = (item: any) => queue.includes(item);
    queue.toString = () => `[${queue.join(', ')}]`;
    
    return queue;
  }

  private createPriorityQueue(): any {
    const heap: any = [];
    
    const heapifyUp = (index: number) => {
      if (index === 0) return;
      const parentIndex = Math.floor((index - 1) / 2);
      if (heap[index] < heap[parentIndex]) {
        [heap[index], heap[parentIndex]] = [heap[parentIndex], heap[index]];
        heapifyUp(parentIndex);
      }
    };
    
    const heapifyDown = (index: number) => {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;
      
      if (leftChild < heap.length && heap[leftChild] < heap[smallest]) {
        smallest = leftChild;
      }
      if (rightChild < heap.length && heap[rightChild] < heap[smallest]) {
        smallest = rightChild;
      }
      
      if (smallest !== index) {
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        heapifyDown(smallest);
      }
    };
    
    heap.offer = (item: any) => {
      heap.push(item);
      heapifyUp(heap.length - 1);
      return true;
    };
    
    heap.add = (item: any) => {
      heap.push(item);
      heapifyUp(heap.length - 1);
      return true;
    };
    
    heap.poll = () => {
      if (heap.length === 0) return null;
      if (heap.length === 1) return heap.pop();
      
      const min = heap[0];
      heap[0] = heap.pop();
      heapifyDown(0);
      return min;
    };
    
    heap.remove = () => {
      if (heap.length === 0) throw new Error('PriorityQueue is empty');
      return heap.poll();
    };
    
    heap.peek = () => {
      if (heap.length === 0) return null;
      return heap[0];
    };
    
    heap.element = () => {
      if (heap.length === 0) throw new Error('PriorityQueue is empty');
      return heap[0];
    };
    
    heap.size = () => heap.length;
    heap.isEmpty = () => heap.length === 0;
    heap.clear = () => { heap.length = 0; };
    heap.contains = (item: any) => heap.includes(item);
    heap.toString = () => `[${heap.join(', ')}]`;
    
    return heap;
  }

  private createTreeSet(): any {
    const set = new Set();
    const sortedArray: any[] = [];
    
    const addSorted = (item: any) => {
      if (set.has(item)) return false;
      set.add(item);
      sortedArray.push(item);
      sortedArray.sort((a, b) => {
        if (typeof a === 'string' && typeof b === 'string') {
          return a.localeCompare(b);
        }
        return a - b;
      });
      return true;
    };
    
    return {
      add: addSorted,
      contains: (item: any) => set.has(item),
      size: () => set.size,
      isEmpty: () => set.size === 0,
      clear: () => { set.clear(); sortedArray.length = 0; },
      remove: (item: any) => {
        if (!set.has(item)) return false;
        set.delete(item);
        const index = sortedArray.indexOf(item);
        if (index > -1) sortedArray.splice(index, 1);
        return true;
      },
      first: () => {
        if (sortedArray.length === 0) throw new Error('TreeSet is empty');
        return sortedArray[0];
      },
      last: () => {
        if (sortedArray.length === 0) throw new Error('TreeSet is empty');
        return sortedArray[sortedArray.length - 1];
      },
      toArray: () => [...sortedArray],
      toString: () => `{${sortedArray.join(', ')}}`
    };
  }

  private createTreeMap(): any {
    const map = new Map();
    const sortedKeys: any[] = [];
    
    const addSortedKey = (key: any) => {
      if (!sortedKeys.includes(key)) {
        sortedKeys.push(key);
        sortedKeys.sort((a, b) => {
          if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b);
          }
          return a - b;
        });
      }
    };
    
    return {
      put: (key: any, value: any) => {
        const oldValue = map.get(key);
        map.set(key, value);
        addSortedKey(key);
        return oldValue;
      },
      get: (key: any) => map.get(key),
      containsKey: (key: any) => map.has(key),
      containsValue: (value: any) => Array.from(map.values()).includes(value),
      size: () => map.size,
      isEmpty: () => map.size === 0,
      clear: () => { map.clear(); sortedKeys.length = 0; },
      remove: (key: any) => {
        const oldValue = map.get(key);
        map.delete(key);
        const index = sortedKeys.indexOf(key);
        if (index > -1) sortedKeys.splice(index, 1);
        return oldValue;
      },
      firstKey: () => {
        if (sortedKeys.length === 0) throw new Error('TreeMap is empty');
        return sortedKeys[0];
      },
      lastKey: () => {
        if (sortedKeys.length === 0) throw new Error('TreeMap is empty');
        return sortedKeys[sortedKeys.length - 1];
      },
      keySet: () => [...sortedKeys],
      values: () => sortedKeys.map(key => map.get(key)),
      entrySet: () => sortedKeys.map(key => [key, map.get(key)]),
      toString: () => `{${sortedKeys.map(k => `${k}=${map.get(k)}`).join(', ')}}`
    };
  }

  private createScanner(): any {
    return {
      next: () => 'sample',
      nextInt: () => 42,
      nextLine: () => 'sample line',
      hasNext: () => true,
      hasNextInt: () => true,
      close: () => {}
    };
  }
}

// Export singleton instance
export const enhancedJavaRuntime = new EnhancedJavaRuntime();
