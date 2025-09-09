// Robust Java Runtime - Single, reliable Java execution system
// This replaces all the fragmented runtime implementations

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

export class RobustJavaRuntime {
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
      console.log('🚀 Starting Java execution...');
      console.log('Code length:', code.length);

      // Basic validation - be more lenient
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

      console.log('✅ Java execution completed:', {
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
      console.error('❌ Java execution failed:', err);
      
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
    
    // Very basic validation - just check for essential structure
    if (!trimmedCode.includes('class')) {
      return { isValid: false, error: 'Java code must contain a class declaration' };
    }
    
    if (!trimmedCode.includes('main')) {
      return { isValid: false, error: 'Java code must contain a main method' };
    }
    
    // Check for balanced braces (basic check)
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
      // Extract main method content - use a more robust approach
      const mainStart = code.indexOf('public static void main(String[] args) {');
      if (mainStart === -1) {
        return { 
          success: false, 
          output: '', 
          error: 'Could not find main method. Please ensure you have: public static void main(String[] args) { ... }' 
        };
      }
      
      // Find the opening brace after main method signature
      const braceStart = code.indexOf('{', mainStart);
      if (braceStart === -1) {
        return { 
          success: false, 
          output: '', 
          error: 'Could not find opening brace for main method' 
        };
      }
      
      // Find the matching closing brace - handle nested braces properly
      let braceCount = 1;
      let i = braceStart + 1;
      let inString = false;
      let stringChar = '';
      
      while (i < code.length && braceCount > 0) {
        const char = code[i];
        
        // Handle string literals to avoid counting braces inside strings
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
      // Parse statements
      const statements = this.parseStatements(mainBody);
      console.log('Parsed statements:', statements);
      
      // Execute each statement
      for (const stmt of statements) {
        if (this.error) break;
        await this.executeStatement(stmt);
      }

      // Format output
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

    console.log('Parsing code:', code);

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
          const trimmed = current.trim();
          if (trimmed && !trimmed.startsWith('//')) {
            statements.push(trimmed);
            console.log(`Parsed statement: "${trimmed}"`);
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
        console.log(`Parsed statement: "${trimmed}"`);
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
      } else if (trimmed.match(/^(int|String|double|boolean|char|ArrayList|HashMap|HashSet|Scanner)\s+\w+/) || 
                 (trimmed.includes('=') && trimmed.match(/^\w+\s+\w+/))) {
        this.handleDeclaration(trimmed);
      } else if (trimmed.includes('=') && !trimmed.includes('==')) {
        this.handleAssignment(trimmed);
      } else if (trimmed.includes('import')) {
        // Skip imports
        return;
      } else if (trimmed.includes('class') || trimmed.includes('public class')) {
        // Skip class declarations
        return;
      } else if (trimmed.includes('throws')) {
        // Skip throws declarations
        return;
      } else if (trimmed === '}' || trimmed === '{') {
        // Skip braces
        return;
      } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        // Try to evaluate other statements
        this.evaluateExpression(trimmed);
      }
    } catch (err) {
      console.error(`Error executing statement "${trimmed}":`, err);
      this.error = `Error in statement "${trimmed}": ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  }

  private handlePrint(stmt: string): void {
    const match = stmt.match(/System\.out\.(println|print)\(([^)]*)\);/);
    if (match) {
      const method = match[1];
      let content = match[2].trim();
      
      try {
        // Evaluate the content
        const evaluatedContent = this.evaluateExpression(content);
        const outputText = String(evaluatedContent);
        
        console.log(`Print statement: "${outputText}"`);
        
        // Add the content to output
        this.output.push(outputText);
        
        // Track memory usage
        this.memoryUsage += outputText.length * 2;
      } catch (error) {
        console.error(`Print error: ${error}`);
        this.output.push(`[Print Error: ${error}]`);
      }
    }
  }

  private handleDeclaration(stmt: string): void {
    // Handle generic types
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
      } else {
        // Create default value based on type
        if (type.startsWith('ArrayList')) {
          value = this.createArrayList();
        } else if (type.startsWith('HashMap')) {
          value = this.createHashMap();
        } else if (type.startsWith('HashSet')) {
          value = this.createHashSet();
        } else if (type === 'Scanner') {
          value = this.createScanner();
        }
      }
      
      this.variables.set(name, { name, type, value });
      this.memoryUsage += this.estimateMemoryUsage(value);
      return;
    }
    
    // Handle non-generic types
    const parts = stmt.split(/\s+/);
    if (parts.length >= 2) {
      const type = parts[0];
      // Extract variable name more carefully
      let name = parts[1];
      if (name.includes('=')) {
        name = name.split('=')[0];
      }
      name = name.replace(/[;,\s]/g, '');
      let value: any = null;
      
      if (stmt.includes('=')) {
        const valueStart = stmt.indexOf('=') + 1;
        const valueEnd = stmt.lastIndexOf(';');
        const valueStr = stmt.substring(valueStart, valueEnd).trim();
        value = this.evaluateExpression(valueStr);
        value = this.convertValue(value, type);
      } else {
        // Use default value for type
        switch (type) {
          case 'int': value = 0; break;
          case 'double': value = 0.0; break;
          case 'boolean': value = false; break;
          case 'String': value = ''; break;
          case 'char': value = '\0'; break;
          case 'ArrayList': value = this.createArrayList(); break;
          case 'HashMap': value = this.createHashMap(); break;
          case 'HashSet': value = this.createHashSet(); break;
          case 'Scanner': value = this.createScanner(); break;
        }
      }
      
      this.variables.set(name, { name, type, value });
      this.memoryUsage += this.estimateMemoryUsage(value);
      console.log(`Variable declared: ${name} = ${value} (type: ${type})`);
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

  private evaluateExpression(expr: string): any {
    expr = expr.trim();
    console.log(`Evaluating: "${expr}"`);
    
    try {
      // Handle string concatenation
      if (expr.includes('+')) {
        const parts = expr.split('+').map(p => p.trim());
        const evaluated = parts.map(p => this.evaluateExpression(p));
        return evaluated.join('');
      }
      
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
      
      // Handle new object creation
      if (expr.startsWith('new ')) {
        const newMatch = expr.match(/new\s+(\w+)(?:<[^>]*>)?\s*\(\s*\)/);
        if (newMatch) {
          const className = newMatch[1];
          switch (className) {
            case 'ArrayList': return this.createArrayList();
            case 'HashMap': return this.createHashMap();
            case 'HashSet': return this.createHashSet();
            case 'Scanner': return this.createScanner();
            default: throw new Error(`Unknown class: ${className}`);
          }
        }
        throw new Error(`Invalid new expression: ${expr}`);
      }
      
      // Handle method calls
      if (expr.includes('.')) {
        const parts = expr.split('.');
        const varName = parts[0];
        const methodCall = parts[1];
        
        if (this.variables.has(varName)) {
          const varInfo = this.variables.get(varName)!;
          const obj = varInfo.value;
          
          if (methodCall.includes('(') && methodCall.includes(')')) {
            const methodName = methodCall.split('(')[0];
            const argsStr = methodCall.match(/\((.*)\)/)?.[1] || '';
            const args = argsStr ? argsStr.split(',').map(arg => this.evaluateExpression(arg.trim())) : [];
            
            if (typeof obj[methodName] === 'function') {
              return obj[methodName](...args);
            } else {
              throw new Error(`Method ${methodName} not found on ${varName}`);
            }
          }
        } else {
          throw new Error(`Variable ${varName} not found`);
        }
      }
      
      // Handle simple arithmetic (including addition)
      if (expr.includes('*') || expr.includes('/') || expr.includes('-') || expr.includes('+')) {
        let evalExpr = expr;
        for (const [name, varInfo] of this.variables) {
          evalExpr = evalExpr.replace(new RegExp(`\\b${name}\\b`, 'g'), String(varInfo.value));
        }
        try {
          return eval(evalExpr);
        } catch (e) {
          // If eval fails, try to handle it as string concatenation
          if (expr.includes('+')) {
            const parts = expr.split('+').map(p => p.trim());
            const evaluated = parts.map(p => this.evaluateExpression(p));
            return evaluated.join('');
          }
          throw e;
        }
      }
      
      // If we get here, it's an unknown expression
      throw new Error(`Unknown expression: "${expr}"`);
      
    } catch (error) {
      console.error(`Error evaluating expression "${expr}":`, error);
      throw error;
    }
  }

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
      }
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
      remove: (item: any) => set.delete(item)
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
    console.log('Formatting output, current output array:', this.output);
    
    if (this.output.length === 0) {
      return 'No output produced. Make sure to use System.out.println() to print results.';
    }

    // Join the output array and clean up any empty lines
    const outputText = this.output.join('\n').trim();
    
    if (!outputText) {
      return 'No output produced. Make sure to use System.out.println() to print results.';
    }

    return outputText;
  }
}

// Export singleton instance
export const robustJavaRuntime = new RobustJavaRuntime();
