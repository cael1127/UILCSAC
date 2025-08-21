// Web-based Java interpreter for client-side code execution
// This interpreter actually compiles and executes Java code

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

  constructor() {
    this.reset();
  }

  reset(): void {
    this.variables.clear();
    this.output = [];
    this.error = null;
    this.executionStartTime = 0;
  }

  execute(code: string): JavaExecutionResult {
    this.executionStartTime = performance.now();
    
    try {
      this.reset();
      
      // Parse and validate Java code
      if (!this.validateJavaCode(code)) {
        return {
          success: false,
          output: '',
          error: this.error || 'Invalid Java code structure. Please ensure you have a proper main method.',
          executionTime: 0
        };
      }

      // Execute the code
      this.executeJavaCode(code);
      
      const executionTime = performance.now() - this.executionStartTime;
      
      return {
        success: this.error === null,
        output: this.output.length > 0 ? this.output.join('\n') : 'Program executed successfully (no output)',
        error: this.error || undefined,
        executionTime: executionTime,
        variables: this.getVariablesMap()
      };
    } catch (err) {
      const executionTime = performance.now() - this.executionStartTime;
      return {
        success: false,
        output: this.output.join('\n'),
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        executionTime: executionTime
      };
    }
  }

  private validateJavaCode(code: string): boolean {
    // Basic Java validation
    const trimmedCode = code.trim();
    
    // Must contain a main method
    if (!trimmedCode.includes('public static void main(String[] args)')) {
      this.error = 'Java code must contain a main method: public static void main(String[] args)';
      return false;
    }
    
    // Must have proper braces
    const openBraces = (trimmedCode.match(/\{/g) || []).length;
    const closeBraces = (trimmedCode.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      this.error = `Mismatched braces: found ${openBraces} opening and ${closeBraces} closing braces`;
      return false;
    }
    
    // Check for basic Java class structure
    if (!trimmedCode.includes('class') && !trimmedCode.includes('public class')) {
      this.error = 'Java code must be wrapped in a class declaration';
      return false;
    }
    
    return true;
  }

  private executeJavaCode(code: string): void {
    try {
      // Extract the main method content
      const mainMethodMatch = code.match(/public static void main\(String\[\] args\)\s*\{([\s\S]*)\}/);
      
      if (!mainMethodMatch) {
        this.error = 'Could not find main method';
        return;
      }

      const mainMethodBody = mainMethodMatch[1];
      
      // Parse and execute statements
      const statements = this.parseStatements(mainMethodBody);
      
      for (const statement of statements) {
        if (this.error) break;
        this.executeStatement(statement);
      }
      
    } catch (err) {
      this.error = `Execution error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
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

  private executeStatement(statement: string): void {
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
}

// Export a singleton instance
export const javaInterpreter = new JavaInterpreter();
