// WebAssembly-based Java execution system
// This system runs Java code in the browser without requiring Java installation

import { wasmJavaLoader, isWebAssemblySupported } from './wasm-java-loader';

export interface JavaExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
  testResults?: any;
  variables?: Record<string, any>;
}

export interface JavaVariable {
  name: string;
  type: string;
  value: any;
}

export class JavaInterpreter {
  private variables: Map<string, JavaVariable> = new Map();
  private output: string[] = [];
  private error: string | null = null;
  private executionStartTime: number = 0;
  private wasmInstance: any = null;
  private isWasmLoaded = false;

  constructor() {
    this.reset();
    this.initializeWasm();
  }

  reset(): void {
    this.variables.clear();
    this.output = [];
    this.error = null;
    this.executionStartTime = 0;
  }

  private async initializeWasm() {
    try {
      // Check if WebAssembly is supported
      if (!isWebAssemblySupported()) {
        console.warn('WebAssembly not supported in this browser');
        this.isWasmLoaded = false;
        return;
      }
      
      console.log('Initializing WebAssembly Java runtime...');
      
      // Load the actual WebAssembly Java runtime
      const runtime = await wasmJavaLoader.load();
      this.wasmInstance = runtime;
      this.isWasmLoaded = true;
      
      console.log('WebAssembly Java runtime ready');
    } catch (error) {
      console.warn('WebAssembly Java runtime not available, falling back to interpreter:', error);
      this.isWasmLoaded = false;
    }
  }

  async execute(code: string): Promise<JavaExecutionResult> {
    this.executionStartTime = performance.now();
    
    try {
      this.reset();
      
      // Basic Java syntax validation
      const validationResult = this.validateJavaCode(code);
      if (!validationResult.isValid) {
        return {
          success: false,
          output: '',
          error: validationResult.error,
          executionTime: 0
        };
      }

      // Execute the code using WebAssembly Java runtime or fallback interpreter
      let result;
      if (this.isWasmLoaded) {
        result = await this.executeWithWasm(code);
      } else {
        result = await this.executeWithInterpreter(code);
      }
      
      const executionTime = performance.now() - this.executionStartTime;
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime: executionTime,
        variables: result.variables || {}
      };
    } catch (err) {
      const executionTime = performance.now() - this.executionStartTime;
      return {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        executionTime: executionTime
      };
    }
  }

  private async executeWithWasm(code: string): Promise<{ success: boolean; output: string; error?: string; variables?: Record<string, any> }> {
    try {
      if (!this.wasmInstance) {
        throw new Error('WebAssembly runtime not initialized');
      }
      
      // Use the actual WebAssembly Java runtime
      const result = await this.wasmInstance.executeJava(code);
      
      return {
        success: result.success,
        output: result.output,
        error: result.error,
        variables: result.variables || {}
      };
      
    } catch (error) {
      console.warn('WebAssembly execution failed, falling back to interpreter:', error);
      
      // Fall back to interpreter if WASM fails
      return await this.executeWithInterpreter(code);
    }
  }

  private async executeWithInterpreter(code: string): Promise<{ success: boolean; output: string; error?: string; variables?: Record<string, any> }> {
    try {
      // Extract the main method content
      const mainMethodMatch = code.match(/public static void main\(String\[\] args\)\s*\{([\s\S]*)\}/);
      
      if (!mainMethodMatch) {
        return {
          success: false,
          output: '',
          error: 'Could not find main method'
        };
      }

      const mainMethodBody = mainMethodMatch[1];
      
      // Parse and execute statements
      const statements = this.parseStatements(mainMethodBody);
      
      for (const statement of statements) {
        if (this.error) break;
        await this.executeStatement(statement);
      }
      
      return {
        success: this.error === null,
        output: this.output.length > 0 ? this.output.join('\n') : 'Program executed successfully (no output)',
        error: this.error || undefined,
        variables: this.getVariablesMap()
      };
      
    } catch (err) {
      return {
        success: false,
        output: '',
        error: `Interpreter execution error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variables: {}
      };
    }
  }

  private validateJavaCode(code: string): { isValid: boolean; error?: string } {
    const trimmedCode = code.trim();
    
    // Check for basic Java structure
    if (!trimmedCode.includes('public class')) {
      return { isValid: false, error: 'Java code must start with "public class"' };
    }
    
    // Check for main method
    if (!trimmedCode.includes('public static void main(String[] args)')) {
      return { isValid: false, error: 'Java code must contain a main method: public static void main(String[] args)' };
    }
    
    // Check for proper class structure
    const classMatch = trimmedCode.match(/public class (\w+)/);
    if (!classMatch) {
      return { isValid: false, error: 'Invalid class declaration syntax' };
    }
    
    const className = classMatch[1];
    
    // Check for matching braces
    const braceValidation = this.validateBraces(trimmedCode);
    if (!braceValidation.isValid) {
      return { isValid: false, error: braceValidation.error };
    }
    
    // Check for semicolons after statements
    const semicolonValidation = this.validateSemicolons(trimmedCode);
    if (!semicolonValidation.isValid) {
      return { isValid: false, error: semicolonValidation.error };
    }
    
    // Check for proper import statements
    const importValidation = this.validateImports(trimmedCode);
    if (!importValidation.isValid) {
      return { isValid: false, error: importValidation.error };
    }
    
    // Check for basic syntax errors
    const syntaxValidation = this.validateBasicSyntax(trimmedCode);
    if (!syntaxValidation.isValid) {
      return { isValid: false, error: syntaxValidation.error };
    }
    
    return { isValid: true };
  }

  private validateBraces(code: string): { isValid: boolean; error?: string } {
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
        
        if (braceLevel < 0) {
          return { isValid: false, error: `Unexpected closing brace '}' at position ${i + 1}` };
        }
      }
    }
    
    if (braceLevel > 0) {
      return { isValid: false, error: `Missing ${braceLevel} closing brace(s)` };
    }
    
    if (braceLevel < 0) {
      return { isValid: false, error: `Unexpected closing brace` };
    }
    
    return { isValid: true };
  }

  private validateSemicolons(code: string): { isValid: boolean; error?: string } {
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines, comments, and lines that should end with semicolons
      if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }
      
      // Check if line should end with semicolon
      if (this.shouldEndWithSemicolon(line) && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
        return { 
          isValid: false, 
          error: `Missing semicolon at line ${i + 1}: "${line}"` 
        };
      }
    }
    
    return { isValid: true };
  }

  private shouldEndWithSemicolon(line: string): boolean {
    const trimmed = line.trim();
    
    // These should end with semicolons
    if (trimmed.includes('System.out.println') || 
        trimmed.includes('=') ||
        trimmed.match(/^(int|String|double|boolean)\s+\w+/)) {
      return true;
    }
    
    return false;
  }

  private validateImports(code: string): { isValid: boolean; error?: string } {
    const lines = code.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ')) {
        // Check if import statement is valid
        if (!trimmed.endsWith(';')) {
          return { isValid: false, error: `Import statement missing semicolon: "${trimmed}"` };
        }
        
        // Check for valid import patterns
        if (!trimmed.match(/^import\s+(java\.(util|io|math)\..*|java\..*);$/)) {
          return { isValid: false, error: `Invalid import statement: "${trimmed}"` };
        }
      }
    }
    
    return { isValid: true };
  }

  private validateBasicSyntax(code: string): { isValid: boolean; error?: string } {
    // Check for common syntax errors
    
    // Check for unmatched quotes
    const singleQuotes = (code.match(/'/g) || []).length;
    const doubleQuotes = (code.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      return { isValid: false, error: 'Unmatched single quotes in code' };
    }
    
    if (doubleQuotes % 2 !== 0) {
      return { isValid: false, error: 'Unmatched double quotes in code' };
    }
    
    // Check for basic Java keywords
    if (!code.includes('class') || !code.includes('public') || !code.includes('static') || !code.includes('void')) {
      return { isValid: false, error: 'Missing required Java keywords (class, public, static, void)' };
    }
    
    return { isValid: true };
  }

  private parseStatements(mainMethodBody: string): string[] {
    // Split into individual statements, handling nested braces
    const statements: string[] = [];
    let currentStatement = '';
    let braceLevel = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < mainMethodBody.length; i++) {
      const char = mainMethodBody[i];
      
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
          currentStatement += char;
          if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
          }
          currentStatement = '';
          continue;
        }
      }
      
      currentStatement += char;
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    return statements.filter(stmt => stmt.trim() && !stmt.trim().startsWith('//'));
  }

  private async executeStatement(statement: string): Promise<void> {
    const trimmedStmt = statement.trim();
    
    try {
      if (trimmedStmt.includes('System.out.println')) {
        this.handlePrintStatement(trimmedStmt);
      } else if (trimmedStmt.includes('=') && !trimmedStmt.includes('==')) {
        this.handleAssignment(trimmedStmt);
      } else if (trimmedStmt.match(/^(int|String|double|boolean)\s+\w+/)) {
        this.handleDeclaration(trimmedStmt);
      } else if (trimmedStmt.includes('if') || trimmedStmt.includes('for') || trimmedStmt.includes('while')) {
        this.handleControlFlow(trimmedStmt);
      } else if (trimmedStmt.trim() && !trimmedStmt.trim().startsWith('//')) {
        // Try to evaluate any other statement
        this.evaluateExpression(trimmedStmt);
      }
    } catch (err) {
      this.error = `Error executing statement "${trimmedStmt}": ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  }

  private handlePrintStatement(statement: string): void {
    const match = statement.match(/System\.out\.println\((.*?)\);/);
    if (match) {
      let content = match[1].trim();
      
      // Handle string literals
      if (content.startsWith('"') && content.endsWith('"')) {
        content = content.slice(1, -1);
      } else if (content.startsWith("'") && content.endsWith("'")) {
        content = content.slice(1, -1);
      } else {
        // Try to resolve variable or expression
        content = this.evaluateExpression(content);
      }
      
      this.output.push(content);
    }
  }

  private handleAssignment(statement: string): void {
    const [varPart, valuePart] = statement.split('=').map(part => part.trim());
    const cleanVarName = varPart.replace(/[;,\s]/g, '');
    
    if (this.variables.has(cleanVarName)) {
      const variable = this.variables.get(cleanVarName)!;
      const value = this.evaluateExpression(valuePart.replace(';', ''));
      variable.value = this.convertValue(value, variable.type);
    }
  }

  private handleDeclaration(statement: string): void {
    const parts = statement.split(/\s+/);
    if (parts.length >= 3) {
      const type = parts[0];
      const name = parts[1].replace(/[;,\s]/g, '');
      let value: any = null;
      
      if (statement.includes('=')) {
        const valueStart = statement.indexOf('=') + 1;
        const valueEnd = statement.lastIndexOf(';');
        const valueStr = statement.substring(valueStart, valueEnd).trim();
        value = this.evaluateExpression(valueStr);
        value = this.convertValue(value, type);
      }
      
      this.variables.set(name, { name, type, value });
    }
  }

  private handleControlFlow(statement: string): void {
    // For now, just skip control flow statements
    // In a full implementation, you'd parse and execute these
    if (statement.includes('if') || statement.includes('for') || statement.includes('while')) {
      // Skip complex control flow for now
      return;
    }
  }

  private evaluateExpression(expression: string): any {
    expression = expression.trim();
    
    // Handle string literals
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1);
    }
    
    if (expression.startsWith("'") && expression.endsWith("'")) {
      return expression.slice(1, -1);
    }
    
    // Handle numeric expressions
    if (/^\d+(\.\d+)?$/.test(expression)) {
      return parseFloat(expression);
    }
    
    // Handle variable references
    if (this.variables.has(expression)) {
      return this.variables.get(expression)!.value;
    }
    
    // Handle simple arithmetic
    if (expression.includes('+') || expression.includes('-') || expression.includes('*') || expression.includes('/')) {
      try {
        // Replace variable names with their values
        let evalExpression = expression;
        for (const [name, variable] of this.variables) {
          evalExpression = evalExpression.replace(new RegExp(`\\b${name}\\b`, 'g'), String(variable.value));
        }
        
        // Basic arithmetic evaluation (be careful with eval in production!)
        return eval(evalExpression);
      } catch {
        return expression; // Return as-is if evaluation fails
      }
    }
    
    return expression;
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

  getVariables(): JavaVariable[] {
    return Array.from(this.variables.values());
  }

  getVariablesMap(): Record<string, any> {
    const variablesMap: Record<string, any> = {};
    for (const [name, variable] of this.variables) {
      variablesMap[name] = variable.value;
    }
    return variablesMap;
  }

  getOutput(): string[] {
    return [...this.output];
  }

  // Check if WebAssembly runtime is available
  isWasmAvailable(): boolean {
    return this.isWasmLoaded;
  }
}

// Export a singleton instance
export const javaInterpreter = new JavaInterpreter();
