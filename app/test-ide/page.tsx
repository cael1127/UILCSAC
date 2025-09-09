import { SimpleJavaIDE } from '@/components/simple-java-ide';

export default function TestIDEPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Simple Java IDE Test</h1>
        <p className="text-lg text-muted-foreground">
          This is a working Java IDE that compiles and executes Java code in the browser without requiring Java installation.
          Perfect for Chromebooks and managed devices.
          </p>
        </div>

      <SimpleJavaIDE 
        questionId="test-1"
        userId="test-user"
        questionTitle="Java Programming Test"
        questionDescription="Write and execute Java code to test the runtime"
      />
                </div>
  );
}
