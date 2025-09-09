import { SimpleJavaIDE } from '@/components/simple-java-ide';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Java IDE with Supabase Integration
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A working Java IDE that executes code and logs all executions to your Supabase database. 
            Perfect for tracking student progress and debugging code execution issues.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Real Code Execution</h3>
            <p className="text-muted-foreground">Execute Java code in the browser using the essential Java runtime</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-lg font-semibold mb-2">Database Logging</h3>
            <p className="text-muted-foreground">All executions are logged to Supabase for analytics and debugging</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Execution History</h3>
            <p className="text-muted-foreground">View complete history of all code executions with performance metrics</p>
          </div>
        </div>

        {/* IDE Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Try the Java IDE</h2>
          <SimpleJavaIDE
            questionId={null}
            userId={null}
            questionTitle="Java Programming Demo"
                          questionDescription="Write and execute Java code to test the IDE. Try this simple example: public class Solution { public static void main(String[] args) { System.out.println('Hello World'); } }"
          />
        </div>

        {/* How It Works */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
              <h4 className="font-semibold mb-2">Write Code</h4>
              <p className="text-sm text-muted-foreground">Write Java code in the editor</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
              <h4 className="font-semibold mb-2">Execute</h4>
              <p className="text-sm text-muted-foreground">Click Run to execute the code</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
              <h4 className="font-semibold mb-2">Get Results</h4>
              <p className="text-sm text-muted-foreground">See output and performance metrics</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">4</div>
              <h4 className="font-semibold mb-2">Database Log</h4>
              <p className="text-sm text-muted-foreground">Execution is logged to Supabase</p>
            </div>
          </div>
        </div>

        {/* Database Integration Info */}
        <div className="mt-12 p-6 bg-info/10 rounded-lg border border-info/20">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">Database Integration</h3>
          <p className="text-blue-800 mb-3">
            This IDE automatically logs all code executions to your <code className="bg-info/20 px-2 py-1 rounded">code_executions</code> table in Supabase.
          </p>
          <div className="text-sm text-blue-700">
            <p><strong>What gets logged:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Complete Java code</li>
              <li>Execution success/failure</li>
              <li>Output or error messages</li>
              <li>Execution time and memory usage</li>
              <li>User and question associations</li>
              <li>Timestamp of execution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
