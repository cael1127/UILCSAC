# WebAssembly Java Runtime Setup Guide

This guide explains how to implement a real WebAssembly Java runtime for your IDE that works on any device, including managed Chromebooks.

## Overview

The current implementation uses a simulated WebAssembly runtime. To make it production-ready, you need to compile a real Java runtime to WebAssembly.

## Option 1: GraalVM Native Image + WebAssembly (Recommended)

### Prerequisites
- GraalVM 22.3+ with native-image support
- Maven or Gradle
- Node.js 16+

### Steps

1. **Install GraalVM Native Image**
   ```bash
   gu install native-image
   ```

2. **Create a Java project with your runtime**
   ```java
   // src/main/java/com/yourcompany/javaruntime/JavaRuntime.java
   public class JavaRuntime {
       public static String executeJava(String code) {
           // Your Java execution logic here
           // This will be compiled to WebAssembly
           return "Output: " + code;
       }
   }
   ```

3. **Compile to WebAssembly**
   ```bash
   native-image --target=wasm --no-fallback JavaRuntime
   ```

4. **Copy the generated .wasm file to your public directory**
   ```bash
   cp JavaRuntime.wasm public/java-runtime.wasm
   ```

## Option 2: TeaVM (Alternative)

TeaVM is specifically designed for compiling Java to WebAssembly.

### Setup
```bash
# Add to your pom.xml
<dependency>
    <groupId>org.teavm</groupId>
    <artifactId>teavm-classlib</artifactId>
    <version>0.9.2</version>
</dependency>
```

### Compile
```bash
mvn teavm:compile
```

## Option 3: Use Pre-built Runtime

Several companies provide pre-compiled Java runtimes:

- **Bytedance's JVM**: https://github.com/bytedance/jvm
- **GraalVM Community**: https://github.com/graalvm/graalvm-ce-builds

## Implementation Steps

### 1. Update the WASM Loader

Replace the simulated loading in `lib/wasm-java-loader.ts`:

```typescript
async load(): Promise<WasmJavaRuntime> {
  try {
    // Load the actual .wasm file
    const response = await fetch('/java-runtime.wasm');
    const wasmBuffer = await response.arrayBuffer();
    
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256 }),
        abort: () => console.error('WASM abort called'),
        // Add other required functions based on your runtime
      }
    });
    
    this.wasmInstance = wasmModule.instance;
    this.isLoaded = true;
    
    return {
      executeJava: this.executeJava.bind(this),
      isReady: this.isLoaded,
      version: this.version
    };
  } catch (error) {
    throw new Error(`WebAssembly loading failed: ${error.message}`);
  }
}
```

### 2. Update the Execute Function

```typescript
private async executeJava(code: string) {
  if (!this.isLoaded) {
    throw new Error('WebAssembly runtime not loaded');
  }

  try {
    // Call the actual WASM function
    const result = await this.wasmInstance.exports.executeJava(code);
    
    return {
      success: true,
      output: result.output,
      error: result.error,
      variables: result.variables
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: `WASM execution error: ${error.message}`,
      variables: {}
    };
  }
}
```

### 3. Add WASM File to Public Directory

```bash
# Copy your compiled .wasm file
cp your-java-runtime.wasm public/java-runtime.wasm
```

### 4. Update next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  
  // Serve .wasm files with correct MIME type
  async headers() {
    return [
      {
        source: '/:path*.wasm',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Benefits of This Approach

✅ **Works everywhere**: No Java installation required  
✅ **Fast execution**: Native WebAssembly performance  
✅ **Secure**: Runs in browser sandbox  
✅ **Offline capable**: Works without internet  
✅ **Cross-platform**: Works on any device with a modern browser  

## Current Status

- ✅ **Auto-reset**: IDE resets between questions
- ✅ **Theme-aware**: All colors use CSS variables
- ✅ **Error handling**: Proper syntax validation
- ✅ **WebAssembly ready**: Framework in place
- 🔄 **Real WASM runtime**: Needs actual .wasm file

## Testing

Once you have a real .wasm file:

1. **Test basic Java execution**
2. **Verify string concatenation** (`+` operator)
3. **Test imports** (`java.util.*`, etc.)
4. **Check error handling** with syntax errors
5. **Test on Chromebook** or other restricted devices

## Performance Considerations

- **Memory limits**: WebAssembly has memory constraints
- **Startup time**: First load may be slower
- **Code size**: Keep runtime minimal for faster loading
- **Caching**: Browser will cache the .wasm file

## Troubleshooting

### Common Issues

1. **WASM file not found**: Check file path and MIME type
2. **Memory errors**: Increase initial memory allocation
3. **Import errors**: Ensure all required functions are exported
4. **Browser compatibility**: Check WebAssembly support

### Debug Commands

```typescript
// Check WASM support
console.log('WASM supported:', isWebAssemblySupported());

// Check memory info
console.log('Memory info:', getWasmMemoryInfo());

// Check runtime status
console.log('Runtime status:', wasmJavaLoader.getStatus());
```

## Next Steps

1. **Choose your compilation method** (GraalVM, TeaVM, or pre-built)
2. **Compile a minimal Java runtime** to WebAssembly
3. **Test the .wasm file** in a simple HTML page
4. **Integrate with your IDE** using the provided framework
5. **Test on target devices** (Chromebooks, etc.)

The framework is ready - you just need to add the actual WebAssembly file!

