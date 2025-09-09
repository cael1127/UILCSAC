// Simple Java Runtime for Browser Execution
// This provides a working Java interpreter without requiring system Java

export interface JavaExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  variables?: Record<string, any>;
  executionTime: number;
  errors?: JavaError[];
  warnings?: JavaWarning[];
}

export interface JavaError {
  type: 'syntax' | 'compilation' | 'runtime';
  message: string;
  line: number;
  column: number;
  code: string;
  suggestion?: string;
}

export interface JavaWarning {
  type: 'deprecation' | 'unused' | 'style';
  message: string;
  line: number;
  column: number;
  code: string;
  suggestion?: string;
}

export class SimpleJavaRuntime {
  private variables: Map<string, any> = new Map();
  private output: string[] = [];
  private errors: JavaError[] = [];
  private warnings: JavaWarning[] = [];
  private error: string | null = null;
  private startTime: number = 0;
  private imports: Set<string> = new Set();

  reset(): void {
    this.variables.clear();
    this.output = [];
    this.errors = [];
    this.warnings = [];
    this.error = null;
    this.startTime = 0;
    this.imports.clear();
  }

  // Enhanced syntax validation
  private validateSyntax(code: string): JavaError[] {
    const errors: JavaError[] = [];
    const lines = code.split('\n');
    
    // Check for basic Java syntax - more flexible
    if (!code.includes('class')) {
      errors.push({
        type: 'syntax',
        message: 'Missing class declaration',
        line: 1,
        column: 1,
        code: 'class',
        suggestion: 'Add "public class Solution {" at the beginning'
      });
    }
    
    // Check for main method - more flexible (handles throws clauses and imports)
    if (!code.includes('main') || !code.includes('String[] args')) {
      errors.push({
        type: 'syntax',
        message: 'Missing main method',
        line: 1,
        column: 1,
        code: 'main method',
        suggestion: 'Add "public static void main(String[] args) { ... }" method (throws clauses and imports are supported)'
      });
    }
    
    // Check for balanced braces
    let braceCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') braceCount++;
        if (line[j] === '}') {
          braceCount--;
          if (braceCount < 0) {
            errors.push({
              type: 'syntax',
              message: 'Unmatched closing brace',
              line: i + 1,
              column: j + 1,
              code: '}',
              suggestion: 'Remove extra closing brace or add opening brace'
            });
          }
        }
      }
    }
    
    if (braceCount > 0) {
      errors.push({
        type: 'syntax',
        message: 'Unmatched opening brace',
        line: lines.length,
        column: 1,
        code: '{',
        suggestion: 'Add missing closing brace'
      });
    }
    
    // Check for missing semicolons
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
          !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
        if (line.includes('System.out.println') || line.includes('=') || 
            line.match(/^(int|String|double|boolean)\s+\w+/)) {
          errors.push({
            type: 'syntax',
            message: 'Missing semicolon',
            line: i + 1,
            column: line.length + 1,
            code: line,
            suggestion: 'Add semicolon (;) at the end of the statement'
          });
        }
      }
    }
    
    return errors;
  }

  async execute(code: string): Promise<JavaExecutionResult> {
    this.startTime = performance.now();
    this.reset();

    try {
      // First validate syntax
      const syntaxErrors = this.validateSyntax(code);
      if (syntaxErrors.length > 0) {
        this.errors = syntaxErrors;
        return {
          success: false,
          output: '',
          error: 'Syntax errors found',
          executionTime: 0,
          errors: syntaxErrors,
          warnings: []
        };
      }

      // Parse and execute the Java code
      const result = await this.executeJavaCode(code);
      const executionTime = performance.now() - this.startTime;

      return {
        success: result.success && this.errors.length === 0,
        output: result.output,
        error: result.error || (this.errors.length > 0 ? 'Execution completed with errors' : undefined),
        variables: result.variables,
        executionTime,
        errors: this.errors,
        warnings: this.warnings
      };
    } catch (err) {
      const executionTime = performance.now() - this.startTime;
      const runtimeError: JavaError = {
        type: 'runtime',
        message: err instanceof Error ? err.message : 'Unknown runtime error',
        line: 1,
        column: 1,
        code: 'runtime',
        suggestion: 'Check your code logic and variable usage'
      };
      
      return {
        success: false,
        output: '',
        error: `Runtime error: ${runtimeError.message}`,
        variables: {},
        executionTime,
        errors: [runtimeError],
        warnings: []
      };
    }
  }

  private async executeJavaCode(code: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
    variables?: Record<string, any>;
  }> {
    try {
      console.log('=== EXECUTE JAVA CODE DEBUG ===');
      console.log('Input code:', code);
      
      // Extract main method content - more flexible regex that handles throws clauses
      const mainMatch = code.match(/public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*args\s*\)\s*(?:throws\s+\w+(?:\s*,\s*\w+)*\s*)?\{([\s\S]*)\}/);
      console.log('Main method match (exact):', mainMatch);
      
      if (!mainMatch) {
        // Try to find any main method signature with throws
        const anyMainMatch = code.match(/main\s*\(\s*String\s*\[\s*\]\s*args\s*\)\s*(?:throws\s+\w+(?:\s*,\s*\w+)*\s*)?\{([\s\S]*)\}/);
        console.log('Main method match (any):', anyMainMatch);
        
        if (!anyMainMatch) {
          console.log('No main method found in code');
          return { success: false, output: '', error: 'Could not find main method. Make sure you have: public static void main(String[] args) { ... }' };
        }
        
        // Found a main method but not with exact signature
        console.warn('Found main method but not with exact signature. Using found method.');
        const mainBody = anyMainMatch[1];
        console.log('Main body (any):', mainBody);
        
        // Parse statements
        const statements = this.parseStatements(mainBody);
        console.log('Parsed statements (any):', statements);
        
        // Execute each statement
        for (const stmt of statements) {
          if (this.error) break;
          await this.executeStatement(stmt);
        }

        // Enhance output with better formatting
        const enhancedOutput = this.enhanceOutput(this.output.join('\n'));
        
        return {
          success: this.error === null,
          output: enhancedOutput,
          error: this.error || undefined,
          variables: this.getVariablesMap()
        };
      }

      const mainBody = mainMatch[1];
      console.log('Main body (exact):', mainBody);
      
      // Parse statements
      const statements = this.parseStatements(mainBody);
      console.log('Parsed statements (exact):', statements);
      
      // Execute each statement
      console.log('=== EXECUTING STATEMENTS ===');
      console.log('Total statements to execute:', statements.length);
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(`Executing statement ${i + 1}/${statements.length}:`, stmt);
        if (this.error) {
          console.log('Error occurred, stopping execution');
          break;
        }
        await this.executeStatement(stmt);
        console.log(`Statement ${i + 1} completed`);
      }
      console.log('=== END STATEMENT EXECUTION ===');

      // Enhance output with better formatting
      const enhancedOutput = this.enhanceOutput(this.output.join('\n'));
      
      return {
        success: this.error === null,
        output: enhancedOutput,
        error: this.error || undefined,
        variables: this.getVariablesMap()
      };

    } catch (err) {
      return {
        success: false,
        output: '',
        error: `Execution error: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
      
      // Handle string literals
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
          if (current.trim()) {
            statements.push(current.trim());
          }
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      statements.push(current.trim());
    }
    
    return statements.filter(s => s.trim() && !s.trim().startsWith('//'));
  }

    private async executeStatement(stmt: string): Promise<void> {
    const trimmed = stmt.trim();
    console.log(`=== EXECUTING STATEMENT: "${trimmed}" ===`);
    
    try {
      if (trimmed.includes('System.out.println')) {
        console.log('Handling print statement');
        this.handlePrint(stmt);
      } else if (trimmed.match(/^(int|String|double|boolean|ArrayList<.*>|HashMap<.*>|HashSet<.*>|Scanner)\s+\w+/)) {
        // Check for variable declarations FIRST (before assignments)
        console.log('Handling variable declaration');
        this.handleDeclaration(stmt);
      } else if (trimmed.includes('=') && !trimmed.includes('==')) {
        // Then check for assignments
        console.log('Handling assignment');
        this.handleAssignment(stmt);
      } else if (trimmed.includes('.') && (trimmed.includes('(') && trimmed.includes(')'))) {
        // Handle method calls like x.add(0), x.get(0)
        console.log('Handling method call');
        const result = this.evaluateExpression(trimmed);
        console.log('Method call result:', result);
      } else if (trimmed.includes('import')) {
        // Handle imports - add to available classes
        console.log('Processing import statement:', trimmed);
        this.handleImport(trimmed);
        return;
      } else if (trimmed.includes('class') || trimmed.includes('public class')) {
        // Skip class declarations
        console.log('Skipping class declaration:', trimmed);
        return;
      } else if (trimmed.includes('throws')) {
        // Skip throws declarations
        console.log('Skipping throws declaration:', trimmed);
        return;
      } else if (trimmed === '}' || trimmed === '{') {
        // Skip braces - they're handled by the parser
        console.log('Skipping brace:', trimmed);
        return;
      } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        // Try to evaluate other statements
        console.log('Evaluating statement:', trimmed);
        this.evaluateExpression(trimmed);
      } else {
        console.log('Statement not handled by any condition:', trimmed);
      }
      
      console.log(`Statement completed: "${trimmed}"`);
    } catch (err) {
      console.error(`Error executing statement "${trimmed}":`, err);
      this.error = `Error in statement "${trimmed}": ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  }

  private handlePrint(stmt: string): void {
    console.log('Processing print statement:', stmt);
    
    // Use a more robust regex that captures everything inside println()
    const match = stmt.match(/System\.out\.println\(([^)]*)\);/);
    if (match) {
      let content = match[1].trim();
      console.log('Print content before evaluation:', content);
      
      try {
        // Always evaluate the content as an expression, even if it looks like a string literal
        // This allows us to handle string concatenation and method calls properly
        const evaluatedContent = this.evaluateExpression(content);
        console.log('Print content after evaluation:', evaluatedContent);
        
        this.output.push(String(evaluatedContent));
        console.log('Added to output:', String(evaluatedContent));
      } catch (error) {
        console.error('Error evaluating print content:', error);
        this.output.push(`[Print Error: ${error}]`);
      }
    } else {
      console.log('No print content found in statement:', stmt);
    }
  }

  private handleAssignment(stmt: string): void {
    const [varPart, valuePart] = stmt.split('=').map(p => p.trim());
    const varName = varPart.replace(/[;,\s]/g, '');
    
    if (this.variables.has(varName)) {
      const value = this.evaluateExpression(valuePart.replace(';', ''));
      this.variables.set(varName, value);
    }
  }

  private handleDeclaration(stmt: string): void {
    // Handle generic types like HashMap<String, Integer> map
    const genericMatch = stmt.match(/^(\w+<[^>]*>)\s+(\w+)/);
    if (genericMatch) {
      const type = genericMatch[1];
      const name = genericMatch[2];
      let value: any = null;
      
      if (stmt.includes('=')) {
        const valueStart = stmt.indexOf('=') + 1;
        const valueEnd = stmt.lastIndexOf(';');
        const valueStr = stmt.substring(valueStart, valueEnd).trim();
        value = this.evaluateExpression(valueStr);
        value = this.convertValue(value, type);
      }
      
      // Handle ArrayList declarations (with or without generics)
      if (type.startsWith('ArrayList')) {
        value = this.createArrayList();
        console.log(`Created ArrayList for variable: ${name}`);
      }
      
      // Handle HashMap declarations (with or without generics)
      if (type.startsWith('HashMap')) {
        value = this.createHashMap();
        console.log(`Created HashMap for variable: ${name}`);
      }
      
      // Handle HashSet declarations (with or without generics)
      if (type.startsWith('HashSet')) {
        value = this.createHashSet();
        console.log(`Created HashSet for variable: ${name}`);
      }
      
      // Handle Scanner declarations
      if (type === 'Scanner') {
        value = this.createScanner();
        console.log(`Created Scanner for variable: ${name}`);
      }
      
      this.variables.set(name, { type, value });
      console.log(`Variable declared: ${name} = ${type} with value:`, value);
      return;
    }
    
    // Handle non-generic types
    const parts = stmt.split(/\s+/);
    if (parts.length >= 3) {
      const type = parts[0];
      const name = parts[1].replace(/[;,\s]/g, '');
      let value: any = null;
      
      if (stmt.includes('=')) {
        const valueStart = stmt.indexOf('=') + 1;
        const valueEnd = stmt.lastIndexOf(';');
        const valueStr = stmt.substring(valueStart, valueEnd).trim();
        value = this.evaluateExpression(valueStr);
        value = this.convertValue(value, type);
      }
      
      // Handle ArrayList declarations (with or without generics)
      if (type.startsWith('ArrayList')) {
        value = this.createArrayList();
        console.log(`Created ArrayList for variable: ${name}`);
      }
      
      // Handle HashMap declarations (with or without generics)
      if (type.startsWith('HashMap')) {
        value = this.createHashMap();
        console.log(`Created HashMap for variable: ${name}`);
      }
      
      // Handle HashSet declarations (with or without generics)
      if (type.startsWith('HashSet')) {
        value = this.createHashSet();
        console.log(`Created HashSet for variable: ${name}`);
      }
      
      // Handle Scanner declarations
      if (type === 'Scanner') {
        value = this.createScanner();
        console.log(`Created Scanner for variable: ${name}`);
      }
      
      this.variables.set(name, { type, value });
      console.log(`Variable declared: ${name} = ${type} with value:`, value);
    }
  }

  private handleImport(importStmt: string): void {
    // Handle import statements - for now just log them
    console.log('Import statement processed:', importStmt);
    
    // Extract the imported class/package
    const match = importStmt.match(/import\s+(.+);/);
    if (match) {
      const imported = match[1];
      console.log('Imported:', imported);
      
      // Add to available imports (could be used for future enhancements)
      if (!this.imports) {
        this.imports = new Set();
      }
      this.imports.add(imported);
    }
  }

  private createArrayList(): any {
    // Enhanced ArrayList implementation
    console.log('Creating new ArrayList...');
    const list: any = [];
    
    // Add Java-like methods
    (list as any).add = (item: any) => {
      console.log(`ArrayList.add(${item}) called`);
      list.push(item);
      console.log(`ArrayList now contains:`, list);
      return true; // Java add() returns boolean
    };
    
    (list as any).get = (index: number) => {
      console.log(`ArrayList.get(${index}) called`);
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for ArrayList of size ${list.length}`);
      }
      const item = list[index];
      console.log(`Retrieved item at index ${index}:`, item);
      return item;
    };
    
    (list as any).size = () => {
      console.log(`ArrayList.size() called, returning ${list.length}`);
      return list.length;
    };
    
    (list as any).set = (index: number, item: any) => {
      console.log(`ArrayList.set(${index}, ${item}) called`);
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for ArrayList of size ${list.length}`);
      }
      const oldItem = list[index];
      list[index] = item;
      console.log(`Set item at index ${index} from ${oldItem} to ${item}`);
      return oldItem; // Java set() returns the old value
    };
    
    (list as any).remove = (index: number) => {
      console.log(`ArrayList.remove(${index}) called`);
      if (index < 0 || index >= list.length) {
        throw new Error(`Index ${index} out of bounds for ArrayList of size ${list.length}`);
      }
      const removedItem = list.splice(index, 1)[0];
      console.log(`Removed item at index ${index}:`, removedItem);
      return removedItem;
    };
    
    (list as any).clear = () => {
      console.log(`ArrayList.clear() called`);
      list.length = 0;
      console.log(`ArrayList cleared, size is now ${list.length}`);
    };
    
    (list as any).isEmpty = () => {
      const isEmpty = list.length === 0;
      console.log(`ArrayList.isEmpty() called, returning ${isEmpty}`);
      return isEmpty;
    };
    
    (list as any).contains = (item: any) => {
      console.log(`ArrayList.contains(${item}) called`);
      const result = list.includes(item);
      console.log(`ArrayList contains ${item}:`, result);
      return result;
    };
    
    (list as any).indexOf = (item: any) => {
      console.log(`ArrayList.indexOf(${item}) called`);
      const result = list.indexOf(item);
      console.log(`Index of ${item}:`, result);
      return result;
    };
    
    (list as any).toString = () => {
      console.log(`ArrayList.toString() called`);
      return `[${list.join(', ')}]`;
    };
    
    console.log('Enhanced ArrayList created with methods:', Object.getOwnPropertyNames(list));
    return list;
  }

  private createHashMap(): any {
    console.log('Creating new HashMap...');
    const map = new Map();
    
    // Create a wrapper object to avoid conflicts with Map's built-in properties
    const hashMap = {
      _map: map,
      
      put: (key: any, value: any) => {
        console.log(`HashMap.put(${key}, ${value}) called`);
        const oldValue = map.get(key);
        map.set(key, value);
        console.log(`HashMap now contains:`, Array.from(map.entries()));
        return oldValue; // Java put() returns the old value
      },
      
      get: (key: any) => {
        console.log(`HashMap.get(${key}) called`);
        const value = map.get(key);
        console.log(`Retrieved value for key ${key}:`, value);
        return value;
      },
      
      containsKey: (key: any) => {
        console.log(`HashMap.containsKey(${key}) called`);
        const result = map.has(key);
        console.log(`HashMap contains key ${key}:`, result);
        return result;
      },
      
      containsValue: (value: any) => {
        console.log(`HashMap.containsValue(${value}) called`);
        const result = Array.from(map.values()).includes(value);
        console.log(`HashMap contains value ${value}:`, result);
        return result;
      },
      
      size: () => {
        console.log(`HashMap.size() called, returning ${map.size}`);
        return map.size;
      },
      
      isEmpty: () => {
        const isEmpty = map.size === 0;
        console.log(`HashMap.isEmpty() called, returning ${isEmpty}`);
        return isEmpty;
      },
      
      clear: () => {
        console.log(`HashMap.clear() called`);
        map.clear();
        console.log(`HashMap cleared, size is now ${map.size}`);
      },
      
      remove: (key: any) => {
        console.log(`HashMap.remove(${key}) called`);
        const oldValue = map.get(key);
        map.delete(key);
        console.log(`Removed key ${key} with value:`, oldValue);
        return oldValue;
      }
    };
    
    console.log('Enhanced HashMap created with methods:', Object.getOwnPropertyNames(hashMap));
    return hashMap;
  }

  private createHashSet(): any {
    console.log('Creating new HashSet...');
    const set = new Set();
    
    // Create a wrapper object to avoid conflicts with Set's built-in properties
    const hashSet = {
      _set: set,
      
      add: (item: any) => {
        console.log(`HashSet.add(${item}) called`);
        const wasAdded = !set.has(item);
        set.add(item);
        console.log(`HashSet now contains:`, Array.from(set));
        return wasAdded; // Java add() returns true if element was added
      },
      
      contains: (item: any) => {
        console.log(`HashSet.contains(${item}) called`);
        const result = set.has(item);
        console.log(`HashSet contains ${item}:`, result);
        return result;
      },
      
      size: () => {
        console.log(`HashSet.size() called, returning ${set.size}`);
        return set.size;
      },
      
      isEmpty: () => {
        const isEmpty = set.size === 0;
        console.log(`HashSet.isEmpty() called, returning ${isEmpty}`);
        return isEmpty;
      },
      
      clear: () => {
        console.log(`HashSet.clear() called`);
        set.clear();
        console.log(`HashSet cleared, size is now ${set.size}`);
      },
      
      remove: (item: any) => {
        console.log(`HashSet.remove(${item}) called`);
        const wasRemoved = set.delete(item);
        console.log(`Removed ${item}:`, wasRemoved);
        return wasRemoved;
      }
    };
    
    console.log('Enhanced HashSet created with methods:', Object.getOwnPropertyNames(hashSet));
    return hashSet;
  }

  private createScanner(): any {
    console.log('Creating new Scanner...');
    const scanner = {
      input: '',
      position: 0
    };
    
    // Add Java-like methods
    (scanner as any).next = () => {
      console.log(`Scanner.next() called`);
      // For demo purposes, return a sample string
      const result = 'sample';
      console.log(`Scanner.next() returned:`, result);
      return result;
    };
    
    (scanner as any).nextInt = () => {
      console.log(`Scanner.nextInt() called`);
      // For demo purposes, return a sample integer
      const result = 42;
      console.log(`Scanner.nextInt() returned:`, result);
      return result;
    };
    
    (scanner as any).nextLine = () => {
      console.log(`Scanner.nextLine() called`);
      // For demo purposes, return a sample line
      const result = 'sample line';
      console.log(`Scanner.nextLine() returned:`, result);
      return result;
    };
    
    (scanner as any).hasNext = () => {
      console.log(`Scanner.hasNext() called`);
      const result = true; // Always return true for demo
      console.log(`Scanner.hasNext() returned:`, result);
      return result;
    };
    
    (scanner as any).hasNextInt = () => {
      console.log(`Scanner.hasNextInt() called`);
      const result = true; // Always return true for demo
      console.log(`Scanner.hasNextInt() returned:`, result);
      return result;
    };
    
    (scanner as any).close = () => {
      console.log(`Scanner.close() called`);
      console.log(`Scanner closed`);
    };
    
    console.log('Enhanced Scanner created with methods:', Object.getOwnPropertyNames(scanner));
    return scanner;
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();
    console.log(`Evaluating expression: "${expr}"`);
    
    try {
      // Handle string concatenation FIRST (before string literal detection)
      if (expr.includes('+')) {
        console.log('Handling string concatenation');
        const parts = expr.split('+').map(p => p.trim());
        console.log('Concatenation parts:', parts);
        const evaluated = parts.map(p => this.evaluateExpression(p));
        console.log('Evaluated parts:', evaluated);
        const result = evaluated.join('');
        console.log('Concatenation result:', result);
        return result;
      }
    
      // Handle string literals (only if no operators)
      if (expr.startsWith('"') && expr.endsWith('"')) {
        const result = expr.slice(1, -1);
        console.log('String literal result:', result);
        return result;
      }
      
      if (expr.startsWith("'") && expr.endsWith("'")) {
        const result = expr.slice(1, -1);
        console.log('Char literal result:', result);
        return result;
      }
      
      // Handle numeric literals
      if (/^\d+(\.\d+)?$/.test(expr)) {
        const result = parseFloat(expr);
        console.log('Numeric literal result:', result);
        return result;
      }
      
      // Handle boolean literals
      if (expr === 'true') {
        console.log('Boolean literal result: true');
        return true;
      }
      if (expr === 'false') {
        console.log('Boolean literal result: false');
        return false;
      }
      
      // Handle null literal
      if (expr === 'null') {
        console.log('Null literal result: null');
        return null;
      }
      
      // Handle variable references
      if (this.variables.has(expr)) {
        const varInfo = this.variables.get(expr);
        console.log(`Variable reference result:`, varInfo.value);
        return varInfo.value;
      }
    
      // Handle new object creation (e.g., new ArrayList<Integer>())
      if (expr.startsWith('new ')) {
        console.log('Handling new object creation');
        const newMatch = expr.match(/new\s+(\w+)(?:<[^>]*>)?\s*\(\s*\)/);
        if (newMatch) {
          const className = newMatch[1];
          console.log(`Creating new ${className}`);
          
          switch (className) {
            case 'ArrayList':
              return this.createArrayList();
            case 'HashMap':
              return this.createHashMap();
            case 'HashSet':
              return this.createHashSet();
            case 'Scanner':
              return this.createScanner();
            default:
              throw new Error(`Unknown class: ${className}`);
          }
        }
        throw new Error(`Invalid new expression: ${expr}`);
      }
      
      // Handle method calls (e.g., x.add(0), x.get(0))
      if (expr.includes('.')) {
        console.log(`Processing method call: ${expr}`);
        const parts = expr.split('.');
        const varName = parts[0];
        const methodCall = parts[1];
        
        console.log(`Variable name: ${varName}, Method call: ${methodCall}`);
        
        if (this.variables.has(varName)) {
          const varInfo = this.variables.get(varName);
          const obj = varInfo.value;
          console.log(`Found variable ${varName} with value:`, obj);
          console.log(`Object type:`, typeof obj);
          console.log(`Object methods:`, Object.getOwnPropertyNames(obj));
          
          if (methodCall.includes('(') && methodCall.includes(')')) {
            const methodName = methodCall.split('(')[0];
            const argsStr = methodCall.match(/\((.*)\)/)?.[1] || '';
            const args = argsStr ? argsStr.split(',').map(arg => this.evaluateExpression(arg.trim())) : [];
            
            console.log(`Method name: ${methodName}, Arguments:`, args);
            console.log(`Method exists:`, typeof obj[methodName]);
            
            if (typeof obj[methodName] === 'function') {
              console.log(`Calling method ${methodName} on ${varName} with args:`, args);
              const result = obj[methodName](...args);
              console.log(`Method ${methodName} returned:`, result);
              return result;
            } else {
              console.log(`Method ${methodName} not found on object`);
              throw new Error(`Method ${methodName} not found on ${varName}`);
            }
          }
        } else {
          console.log(`Variable ${varName} not found in variables:`, Array.from(this.variables.keys()));
          throw new Error(`Variable ${varName} not found`);
        }
      }
    
      // Handle simple arithmetic
      if (expr.includes('*') || expr.includes('/') || expr.includes('-')) {
        console.log('Handling arithmetic expression');
        try {
          let evalExpr = expr;
          for (const [name, varInfo] of this.variables) {
            evalExpr = evalExpr.replace(new RegExp(`\\b${name}\\b`, 'g'), String(varInfo.value));
          }
          const result = eval(evalExpr);
          console.log('Arithmetic result:', result);
          return result;
        } catch (error) {
          console.log('Arithmetic evaluation failed:', error);
          throw new Error(`Arithmetic evaluation failed: ${error}`);
        }
      }
      
      // If we get here, it's an unknown expression
      console.log(`Unknown expression: "${expr}"`);
      throw new Error(`Unknown expression: "${expr}"`);
      
    } catch (error) {
      console.error(`Error evaluating expression "${expr}":`, error);
      throw error;
    }
  }

  private convertValue(value: any, targetType: string): any {
    switch (targetType) {
      case 'int':
        return parseInt(value) || 0;
      case 'double':
        return parseFloat(value) || 0.0;
      case 'boolean':
        return Boolean(value);
      case 'String':
        return String(value);
      default:
        return value;
    }
  }

  private getVariablesMap(): Record<string, any> {
    const vars: Record<string, any> = {};
    for (const [name, varInfo] of this.variables) {
      vars[name] = varInfo.value;
    }
    return vars;
  }

  private enhanceOutput(output: string): string {
    if (!output.trim()) {
      return 'No output produced. Make sure to use System.out.println() to print results.';
    }

    // Add execution header and footer
    const lines = output.split('\n');
    const enhancedLines = [
      '=== Java Console Output ===',
      ...lines,
      '=== End of Output ==='
    ];

    return enhancedLines.join('\n');
  }
}

// Export singleton instance
export const simpleJavaRuntime = new SimpleJavaRuntime();

