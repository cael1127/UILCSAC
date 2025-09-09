import { UnifiedJavaIDE } from '@/components/unified-java-ide';

export default function TestIDEFixedPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Fixed Java IDE Test</h1>
          <p className="text-[var(--muted-foreground)]">
            This page tests the new unified Java IDE implementation. Try running some Java code!
          </p>
        </div>

        <UnifiedJavaIDE
          questionId="test-question-1"
          userId="test-user-1"
          questionTitle="Test Problem: Hello World"
          questionDescription="Write a simple Hello World program in Java"
          testCases={[
            {
              id: "test-1",
              input: "",
              expected_output: "Hello, World!",
              is_sample: true,
              points: 10
            }
          ]}
          templateCode={`public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Test basic operations
        int a = 5;
        int b = 3;
        int sum = a + b;
        System.out.println("Sum: " + sum);
        
        // Test string concatenation
        String name = "Java";
        System.out.println("Hello, " + name + "!");
    }
}`}
        />
      </div>
    </div>
  );
}
