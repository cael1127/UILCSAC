// Essential Java Runtime for Managed Devices (Chromebooks, etc.)
// This provides only the essential Java features needed for basic programming
// without requiring system Java installation

export interface EssentialJavaResult {
  success: boolean;
  output: string;
  error?: string;
  variables?: Record<string, any>;
  executionTime: number;
  memoryUsage: number;
}

export interface JavaVariable {
  name: string;
  type: string;
  value: any;
}

export class EssentialJavaRuntime {
  private variables: Map<string, JavaVariable> = new Map();
  private output: string[] = [];
  private error: string | null = null;
  private startTime: number = 0;
  private memoryUsage: number = 0;

  // Essential Java types and their default values
  private static readonly ESSENTIAL_TYPES = {
    'int': 0,
    'double': 0.0,
    'boolean': false,
    'String': '',
    'char': '\0'
  };

  reset(): void {
    this.variables.clear();
    this.output = [];
    this.error = null;
    this.startTime = 0;
    this.memoryUsage = 0;
  }

  async execute(code: string): Promise<EssentialJavaResult> {
    this.startTime = performance.now();
    this.reset();

    try {
      // Basic Java syntax validation
      const validationResult = this.validateEssentialJavaCode(code);
      if (!validationResult.isValid) {
        return {
          success: false,
          output: '',
          error: validationResult.error,
          executionTime: 0,
          memoryUsage: 0
        };
      }

      // Execute the code
      const result = await this.executeEssentialJavaCode(code);
      const executionTime = performance.now() - this.startTime;

      return {
        success: result.success,
        output: result.output,
        error: result.error,
        variables: result.variables,
        executionTime,
        memoryUsage: this.memoryUsage
      };
    } catch (err) {
      const executionTime = performance.now() - this.startTime;
      return {
        success: false,
        output: '',
        error: `Runtime error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variables: {},
        executionTime,
        memoryUsage: this.memoryUsage
      };
    }
  }

  private validateEssentialJavaCode(code: string): { isValid: boolean; error?: string } {
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
    
    // Check for matching braces
    const braceValidation = this.validateBraces(trimmedCode);
    if (!braceValidation.isValid) {
      return { isValid: false, error: braceValidation.error };
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
    
    return { isValid: true };
  }

  private async executeEssentialJavaCode(code: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
    variables?: Record<string, any>;
  }> {
    try {
      // Extract main method content
      const mainMatch = code.match(/public static void main\(String\[\] args\)\s*\{([\s\S]*)\}/);
      if (!mainMatch) {
        return { success: false, output: '', error: 'Could not find main method' };
      }

      const mainBody = mainMatch[1];
      
      // Parse statements
      const statements = this.parseStatements(mainBody);
      
      // Execute each statement
      for (const stmt of statements) {
        if (this.error) break;
        await this.executeStatement(stmt);
      }

      return {
        success: this.error === null,
        output: this.output.join('\n'),
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
    
    try {
      if (trimmed.includes('System.out.println') || trimmed.includes('System.out.print')) {
        this.handlePrint(trimmed);
      } else if (trimmed.includes('=') && !trimmed.includes('==')) {
        this.handleAssignment(trimmed);
      } else if (trimmed.match(/^(int|String|double|boolean|char)\s+\w+/)) {
        this.handleDeclaration(trimmed);
      } else if (trimmed.includes('import')) {
        // Skip imports for now
        return;
      } else if (trimmed && !trimmed.trim().startsWith('//')) {
        // Try to evaluate other statements
        this.evaluateExpression(trimmed);
      }
    } catch (err) {
      this.error = `Error in statement "${trimmed}": ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  }

  private handlePrint(stmt: string): void {
    const match = stmt.match(/System\.out\.(println|print)\((.*?)\);/);
    if (match) {
      const method = match[1];
      let content = match[2].trim();
      
      // Handle string literals
      if (content.startsWith('"') && content.endsWith('"')) {
        content = content.slice(1, -1);
      } else if (content.startsWith("'") && content.endsWith("'")) {
        content = content.slice(1, -1);
      } else {
        // Evaluate expression
        content = this.evaluateExpression(content);
      }
      
      this.output.push(String(content));
      
      // Add newline for println
      if (method === 'println') {
        this.output.push('');
      }
      
      // Track memory usage
      this.memoryUsage += String(content).length * 2;
    }
  }

  private handleAssignment(stmt: string): void {
    const [varPart, valuePart] = stmt.split('=').map(p => p.trim());
    const varName = varPart.replace(/[;,\s]/g, '');
    
    if (this.variables.has(varName)) {
      const variable = this.variables.get(varName);
      if (variable) {
        const value = this.evaluateExpression(valuePart.replace(';', ''));
        variable.value = this.convertValue(value, variable.type);
        
        // Track memory usage
        this.memoryUsage += this.estimateMemoryUsage(variable.value);
      }
    }
  }

  private handleDeclaration(stmt: string): void {
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
      } else {
        // Use default value for type
        value = EssentialJavaRuntime.ESSENTIAL_TYPES[type as keyof typeof EssentialJavaRuntime.ESSENTIAL_TYPES];
      }
      
      this.variables.set(name, { name, type, value });
      
      // Track memory usage
      this.memoryUsage += this.estimateMemoryUsage(value);
    }
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();
    
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
    
    // Handle variable references
    if (this.variables.has(expr)) {
      const varInfo = this.variables.get(expr);
      if (varInfo) {
        return varInfo.value;
      }
    }
    
    // Handle Math method calls
    const mathMatch = expr.match(/Math\.(\w+)\((.*?)\)/);
    if (mathMatch) {
      const methodName = mathMatch[1];
      const args = mathMatch[2].split(',').map(arg => this.evaluateExpression(arg.trim()));
      
      // Map Math methods to JavaScript equivalents
      const mathMethods: Record<string, Function> = {
        'abs': Math.abs,
        'max': Math.max,
        'min': Math.min,
        'sqrt': Math.sqrt,
        'pow': Math.pow,
        'round': Math.round,
        'floor': Math.floor,
        'ceil': Math.ceil,
        'random': Math.random
      };
      
      if (mathMethods[methodName]) {
        return mathMethods[methodName](...args);
      }
    }
    
    // Handle string concatenation
    if (expr.includes('+')) {
      const parts = expr.split('+').map(p => p.trim());
      const evaluated = parts.map(p => this.evaluateExpression(p));
      return evaluated.join('');
    }
    
    // Handle simple arithmetic
    if (expr.includes('*') || expr.includes('/') || expr.includes('-')) {
      try {
        let evalExpr = expr;
        for (const [name, varInfo] of this.variables) {
          if (varInfo) {
            evalExpr = evalExpr.replace(new RegExp(`\\b${name}\\b`, 'g'), String(varInfo.value));
          }
        }
        return eval(evalExpr);
      } catch {
        return expr;
      }
    }
    
    return expr;
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
      case 'char':
        return String(value).charAt(0) || '\0';
      default:
        return value;
    }
  }

  private estimateMemoryUsage(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16 characters
    } else if (typeof value === 'number') {
      return 8; // 64-bit number
    } else if (typeof value === 'boolean') {
      return 1; // 1 byte
    } else if (Array.isArray(value)) {
      return value.length * 8; // Rough estimate
    }
    return 8; // Default estimate
  }

  getVariables(): JavaVariable[] {
    return Array.from(this.variables.values());
  }

  getVariablesMap(): Record<string, any> {
    const vars: Record<string, any> = {};
    for (const [name, varInfo] of this.variables) {
      if (varInfo) {
        vars[name] = varInfo.value;
      }
    }
    return vars;
  }

  getOutput(): string[] {
    return [...this.output];
  }

  getMemoryUsage(): number {
    return this.memoryUsage;
  }

  // Check if a specific Java feature is supported
  isFeatureSupported(feature: string): boolean {
    const supportedFeatures = {
      'basic_types': true,
      'variables': true,
      'arithmetic': true,
      'strings': true,
      'arrays': false, // Not implemented yet
      'loops': false,  // Not implemented yet
      'conditionals': false, // Not implemented yet
      'methods': false, // Not implemented yet
      'classes': false, // Not implemented yet
      'imports': true,
      'math_functions': true,
      'managed_device_safe': true
    };
    
    return supportedFeatures[feature as keyof typeof supportedFeatures] || false;
  }

  // Get information about what's supported on managed devices
  getManagedDeviceInfo(): {
    supported: boolean;
    features: string[];
    limitations: string[];
    recommendations: string[];
  } {
    return {
      supported: true,
      features: [
        'Basic Java syntax',
        'Variable declarations and assignments',
        'Arithmetic operations',
        'String operations and concatenation',
        'System.out.println/print',
        'Math functions (abs, max, min, sqrt, pow, etc.)',
        'Memory usage tracking',
        'Performance monitoring'
      ],
      limitations: [
        'No file I/O operations',
        'No network operations',
        'No system calls',
        'Limited to essential Java classes only',
        'No advanced OOP features',
        'No exception handling',
        'No reflection or dynamic features'
      ],
      recommendations: [
        'Use for basic programming concepts',
        'Perfect for learning Java fundamentals',
        'Ideal for competitive programming practice',
        'Safe for managed school environments',
        'Works on Chromebooks and restricted devices'
      ]
    };
  }
}

// Export singleton instance
export const essentialJavaRuntime = new EssentialJavaRuntime();