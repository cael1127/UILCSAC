"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Play, RotateCcw, CheckCircle, XCircle, Shield, Monitor, Code, Terminal, Info } from 'lucide-react';

// Minimal code editor for managed devices
const MinimalCodeEditor = ({ value, onChange, height }: {
  value: string;
  onChange: (value: string) => void;
  height: string;
}) => (
  <div className="relative">
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-md overflow-hidden shadow-sm">
      {/* Simple header */}
      <div className="bg-[var(--muted)] px-3 py-2 border-b border-[var(--border)] flex items-center gap-2">
        <Shield className="h-4 w-4 text-[var(--success)]" />
        <span className="text-xs text-[var(--muted-foreground)] font-medium">Solution.java</span>
        <Badge variant="outline" className="text-xs border-[var(--success)] text-[var(--success)]">
          Managed Device Safe
        </Badge>
      </div>
      
      {/* Code area */}
      <div className="flex">
        {/* Line numbers */}
        <div className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs py-3 px-2 border-r border-[var(--border)] select-none">
          {value.split('\n').map((_: string, index: number) => (
            <div key={index} className="text-right pr-2 leading-6">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-3 bg-[var(--input)] text-[var(--foreground)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] leading-6 transition-colors"
          placeholder="Write your Java code here..."
          style={{ height, minHeight: '400px' }}
          spellCheck={false}
        />
      </div>
    </div>
  </div>
);

interface ManagedDeviceIDEProps {
  questionId: string;
  userId: string;
  questionTitle: string;
  questionDescription: string;
  templateCode?: string;
  onExecutionComplete?: (result: any) => void;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  executionTime: number;
  memoryUsage: number;
  variables?: Record<string, any>;
  managedDeviceInfo?: any;
  environment: {
    name: string;
    version: string;
    timeout: number;
    memoryLimit: number;
    managedDeviceSafe: boolean;
    chromebookCompatible: boolean;
  };
}

// Essential Java templates for managed devices
const ESSENTIAL_JAVA_TEMPLATES = {
  basic: `public class Solution {
    public static void main(String[] args) {
        // Basic Java program for managed devices
        System.out.println("Hello from Chromebook!");
        
        int number = 42;
        String message = "The answer is: " + number;
        System.out.println(message);
    }
}`,

  math: `public class Solution {
    public static void main(String[] args) {
        // Math operations example
        double radius = 5.0;
        double area = Math.PI * radius * radius;
        
        System.out.println("Radius: " + radius);
        System.out.println("Area: " + area);
        System.out.println("PI: " + Math.PI);
    }
}`,

  variables: `public class Solution {
    public static void main(String[] args) {
        // Variable types and operations
        int age = 16;
        String name = "Student";
        double gpa = 3.8;
        boolean isActive = true;
        
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("GPA: " + gpa);
        System.out.println("Active: " + isActive);
    }
}`,

  strings: `public class Solution {
    public static void main(String[] args) {
        // String operations
        String firstName = "John";
        String lastName = "Doe";
        String fullName = firstName + " " + lastName;
        
        System.out.println("First: " + firstName);
        System.out.println("Last: " + lastName);
        System.out.println("Full: " + fullName);
        System.out.println("Length: " + fullName.length());
    }
}`
};

export const ManagedDeviceIDE = React.memo(function ManagedDeviceIDE({
  questionId,
  userId,
  questionTitle,
  questionDescription,
  templateCode = '',
  onExecutionComplete
}: ManagedDeviceIDEProps) {
  // Early return if no question data
  if (!questionId || !userId) {
    return (
      <div className="text-center py-8 text-[var(--muted-foreground)]">
        <p>No question data available</p>
      </div>
    );
  }

  const [code, setCode] = useState(templateCode || ESSENTIAL_JAVA_TEMPLATES.basic);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('basic');

  // Auto-detect template and reset when question changes
  useEffect(() => {
    setExecutionResult(null);
    
    if (!templateCode) {
      const questionText = (questionDescription + ' ' + questionTitle).toLowerCase();
      
      if (questionText.includes('math') || questionText.includes('calculate')) {
        setCode(ESSENTIAL_JAVA_TEMPLATES.math);
        setSelectedTemplate('math');
      } else if (questionText.includes('string') || questionText.includes('text')) {
        setCode(ESSENTIAL_JAVA_TEMPLATES.strings);
        setSelectedTemplate('strings');
      } else if (questionText.includes('variable') || questionText.includes('type')) {
        setCode(ESSENTIAL_JAVA_TEMPLATES.variables);
        setSelectedTemplate('variables');
      } else {
        setCode(ESSENTIAL_JAVA_TEMPLATES.basic);
        setSelectedTemplate('basic');
      }
    } else {
      setCode(templateCode);
    }
  }, [templateCode, questionDescription, questionTitle, questionId]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const executeCode = async () => {
    if (!code.trim()) {
      setExecutionResult({
        success: false,
        output: '',
        error: 'No code to execute',
        executionTime: 0,
        memoryUsage: 0,
        environment: {
          name: 'Essential Java Runtime for Managed Devices',
          version: '1.0.0',
          timeout: 10000,
          memoryLimit: 50,
          managedDeviceSafe: true,
          chromebookCompatible: true
        }
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/essential-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: 'java',
          questionId,
          userId,
        }),
      });

      const result: ExecutionResult = await response.json();

      if (response.ok) {
        setExecutionResult(result);
        if (onExecutionComplete) {
          onExecutionComplete(result);
        }
      } else {
        setExecutionResult({
          success: false,
          output: '',
          error: result.error || 'Execution failed',
          executionTime: 0,
          memoryUsage: 0,
          environment: {
            name: 'Essential Java Runtime for Managed Devices',
            version: '1.0.0',
            timeout: 10000,
            memoryLimit: 50,
            managedDeviceSafe: true,
            chromebookCompatible: true
          }
        });
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0,
        memoryUsage: 0,
        environment: {
          name: 'Essential Java Runtime for Managed Devices',
          version: '1.0.0',
          timeout: 10000,
          memoryLimit: 50,
          managedDeviceSafe: true,
          chromebookCompatible: true
        }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    setCode(ESSENTIAL_JAVA_TEMPLATES[selectedTemplate as keyof typeof ESSENTIAL_JAVA_TEMPLATES]);
  };

  const changeTemplate = (template: string) => {
    setSelectedTemplate(template);
    setCode(ESSENTIAL_JAVA_TEMPLATES[template as keyof typeof ESSENTIAL_JAVA_TEMPLATES]);
  };

  const getConsoleOutput = () => {
    if (!executionResult) return null;

    if (executionResult.success) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--success)]">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Execution Successful</span>
            <Badge variant="outline" className="text-xs border-[var(--success)] text-[var(--success)]">
              {executionResult.executionTime}ms
            </Badge>
            <Badge variant="outline" className="text-xs border-[var(--success)] text-[var(--success)]">
              {Math.round(executionResult.memoryUsage)}MB
            </Badge>
          </div>
          
          {executionResult.output && (
            <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 p-3 rounded-md">
              <h4 className="font-medium text-[var(--success)] mb-2">Console Output:</h4>
              <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                {executionResult.output}
              </pre>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--destructive)]">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Execution Failed</span>
            <Badge variant="outline" className="text-xs border-[var(--destructive)] text-[var(--destructive)]">
              {executionResult.executionTime}ms
            </Badge>
          </div>
          
          <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 p-3 rounded-md">
            <h4 className="font-medium text-[var(--destructive)] mb-2">Error Details:</h4>
            <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {executionResult.error}
            </pre>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Managed device header */}
      <div className="bg-gradient-to-r from-[var(--success)]/20 to-[var(--success)]/10 border border-[var(--success)]/30 rounded-t-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[var(--success)]" />
          <span className="font-medium text-[var(--foreground)]">Managed Device Java IDE</span>
          <div className="ml-auto flex items-center gap-2">
            <Monitor className="h-4 w-4 text-[var(--success)]" />
            <span className="text-xs text-[var(--muted-foreground)]">Chromebook Compatible</span>
          </div>
        </div>
        <div className="text-sm text-[var(--muted-foreground)] mt-1">
          Safe Java runtime for managed school environments - no system Java required
        </div>
      </div>
      
      {/* Template selector */}
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm">
        <CardHeader className="pb-3 bg-[var(--muted)] border-b border-[var(--border)]">
          <CardTitle className="text-lg text-[var(--foreground)] flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(ESSENTIAL_JAVA_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant={selectedTemplate === key ? "default" : "outline"}
                size="sm"
                onClick={() => changeTemplate(key)}
                className="text-xs"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main editor area */}
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm">
        <CardHeader className="pb-3 bg-[var(--muted)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-[var(--foreground)]">Solution.java</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={resetCode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-[var(--border)] bg-[var(--input)] hover:bg-[var(--muted)]"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={executeCode}
                disabled={isExecuting || !code.trim()}
                className="bg-[var(--success)] hover:bg-[var(--success)]/90 text-[var(--success-foreground)]"
              >
                <Play className="h-4 w-4 mr-2" />
                {isExecuting ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            <strong>Supported:</strong> Basic Java syntax, variables, math, strings
            <br />
            <strong>Safe for:</strong> Chromebooks, managed devices, school environments
            <br />
            <span className="text-[var(--success)]">✅ No Java installation required - Test it now!</span>
          </div>
        </CardHeader>
        <CardContent>
          <MinimalCodeEditor
            value={code}
            onChange={handleCodeChange}
            height="400px"
          />
        </CardContent>
      </Card>

      {/* Console Section */}
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm">
        <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)]">
          <CardTitle className="text-lg text-[var(--foreground)] flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Console Output
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!executionResult ? (
            <div className="text-center py-6 text-[var(--muted-foreground)]">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No code executed yet. Run your code to see results here.</p>
            </div>
          ) : (
            getConsoleOutput()
          )}
        </CardContent>
      </Card>

      {/* Managed device info */}
      {executionResult?.managedDeviceInfo && (
        <Card className="border-[var(--success)]/30 bg-[var(--success)]/5 shadow-sm">
          <CardHeader className="pb-3 bg-[var(--success)]/10 border-b border-[var(--success)]/20">
            <CardTitle className="text-lg text-[var(--foreground)] flex items-center gap-2">
              <Info className="h-5 w-5 text-[var(--success)]" />
              Managed Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">✅ Supported Features:</h4>
                <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                  {executionResult.managedDeviceInfo.features.slice(0, 5).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">⚠️ Limitations:</h4>
                <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                  {executionResult.managedDeviceInfo.limitations.slice(0, 3).map((limitation: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]"></div>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});


