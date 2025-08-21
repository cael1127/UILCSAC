import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, RotateCcw, CheckCircle, XCircle, Clock, Zap } from "lucide-react"
import CodeEditor from "@/components/code-editor"
import { useState } from "react"

export default function TestIDEPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Web IDE Test Page</h1>
          <p className="text-muted-foreground">
            Test the web-based Java execution environment and code editor
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Java Code Editor Test
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Java</Badge>
              <Badge variant="outline">Web Execution</Badge>
              <Badge variant="outline">Real-time</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Code Editor</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="tests">Test Cases</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Sample Java Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Write and test Java code directly in your browser
                  </p>
                </div>
                
                <CodeEditor
                  value={`public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, UIL CS Academy!");
        
        // Test some basic operations
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum of 1 to 10: " + sum);
        
        // Test string operations
        String message = "Competitive Programming";
        System.out.println("Message length: " + message.length());
        System.out.println("Uppercase: " + message.toUpperCase());
    }
}`}
                  onChange={() => {}}
                  language="java"
                  height="400px"
                  theme="vs-dark"
                />

                <div className="flex gap-2">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                  <Button variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="output" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Execution Output</h3>
                  <p className="text-sm text-muted-foreground">
                    View the results of your code execution
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <div className="text-green-600">✓ Program executed successfully</div>
                  <div className="text-foreground mt-2">
                    Hello, UIL CS Academy!<br/>
                    Sum of 1 to 10: 55<br/>
                    Message length: 23<br/>
                    Uppercase: COMPETITIVE PROGRAMMING
                  </div>
                  <div className="text-muted-foreground mt-2">
                    Execution time: 2.3ms<br/>
                    Memory usage: 1.2MB
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tests" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Test Cases</h3>
                  <p className="text-sm text-muted-foreground">
                    Automated testing of your code
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">Test Case 1:</span>
                      <span className="text-muted-foreground ml-2">Basic output verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Passed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">Test Case 2:</span>
                      <span className="text-muted-foreground ml-2">Mathematical operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Passed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">Test Case 3:</span>
                      <span className="text-muted-foreground ml-2">String operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Passed</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IDE Features Tested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium">Code Editor</div>
                <div className="text-sm text-muted-foreground">Monaco Editor</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium">Java Support</div>
                <div className="text-sm text-muted-foreground">Syntax Highlighting</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium">Web Execution</div>
                <div className="text-sm text-muted-foreground">Browser-based</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium">Test Cases</div>
                <div className="text-sm text-muted-foreground">Automated Testing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
