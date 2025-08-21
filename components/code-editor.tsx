"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  theme?: string
  readOnly?: boolean
}

// Pre-configure Monaco Editor themes when it loads
const configureMonacoThemes = async () => {
  const monaco = await import('monaco-editor')
  
  monaco.editor.defineTheme("uil-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "d97706", fontStyle: "bold" },
      { token: "string", foreground: "10b981" },
      { token: "number", foreground: "f59e0b" },
      { token: "type", foreground: "ec4899" },
      { token: "function", foreground: "3b82f6" },
    ],
    colors: {
      "editor.background": "#1f2937",
      "editor.foreground": "#f9fafb",
      "editor.lineHighlightBackground": "#374151",
      "editor.selectionBackground": "#4b5563",
      "editorCursor.foreground": "#d97706",
      "editorLineNumber.foreground": "#6b7280",
      "editorLineNumber.activeForeground": "#d97706",
    },
  })

  monaco.editor.defineTheme("uil-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "d97706", fontStyle: "bold" },
      { token: "string", foreground: "059669" },
      { token: "number", foreground: "d97706" },
      { token: "type", foreground: "ec4899" },
      { token: "function", foreground: "2563eb" },
    ],
    colors: {
      "editor.background": "#fefce8",
      "editor.foreground": "#374151",
      "editor.lineHighlightBackground": "#f9fafb",
      "editor.selectionBackground": "#e5e7eb",
      "editorCursor.foreground": "#d97706",
      "editorLineNumber.foreground": "#9ca3af",
      "editorLineNumber.activeForeground": "#d97706",
    },
  })
  
  return monaco
}

function CodeEditorComponent({
  value,
  onChange,
  language,
  height = "400px",
  theme = "vs-dark",
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize language mapping for better performance
  const monacoLanguage = useMemo(() => {
    const languageMap: Record<string, string> = {
      java: "java",
      python: "python",
      cpp: "cpp",
      javascript: "javascript",
      typescript: "typescript",
      c: "c",
      csharp: "csharp",
      go: "go",
      rust: "rust",
      kotlin: "kotlin",
      swift: "swift",
    }
    return languageMap[language] || "plaintext"
  }, [language])

  // Memoize editor options for better performance
  const editorOptions = useMemo(() => ({
    value,
    language: monacoLanguage,
    theme: theme === "vs-dark" ? "uil-dark" : "uil-light",
    readOnly,
    fontSize: 14,
    lineNumbers: "on" as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    minimap: { enabled: false },
    wordWrap: "on" as const,
    tabSize: 2,
    insertSpaces: true,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    contextmenu: true,
    mouseWheelZoom: true,
    smoothScrolling: true,
    cursorBlinking: "blink" as const,
    cursorSmoothCaretAnimation: "on" as const,
    renderLineHighlight: "line" as const,
    selectOnLineNumbers: true,
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true,
      highlightActiveIndentation: true,
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
    },
  }), [value, monacoLanguage, theme, readOnly])

  // Initialize editor with better error handling
  const initializeEditor = useCallback(async () => {
    if (!editorRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      const monaco = await configureMonacoThemes()
      
      if (editorRef.current) {
        monacoRef.current = monaco.editor.create(editorRef.current, editorOptions)
        
        // Handle content changes
        monacoRef.current.onDidChangeModelContent(() => {
          if (monacoRef.current) {
            onChange(monacoRef.current.getValue())
          }
        })

        // Add code snippets
        addCodeSnippets(language, monaco)
        
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Failed to initialize Monaco Editor:', err)
      setError('Failed to load code editor')
      setIsLoading(false)
    }
  }, [editorOptions, language, onChange])

  // Initialize editor when component mounts
  useEffect(() => {
    initializeEditor()
    
    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
      }
    }
  }, [initializeEditor])

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value)
    }
  }, [value])

  // Update editor language when prop changes
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel()
      if (model) {
        import('monaco-editor').then(monaco => {
          monaco.editor.setModelLanguage(model, monacoLanguage)
        }).catch(console.error)
      }
    }
  }, [monacoLanguage])

  // Update editor theme when prop changes
  useEffect(() => {
    if (monacoRef.current) {
      import('monaco-editor').then(monaco => {
        monaco.editor.setTheme(theme === "vs-dark" ? "uil-dark" : "uil-light")
      }).catch(console.error)
    }
  }, [theme])

  const addCodeSnippets = useCallback((lang: string, monaco: any) => {
    const snippets: Record<string, any[]> = {
      java: [
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ["public static void main(String[] args) {", "\t${1:// Your code here}", "}"].join("\n"),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main method template",
        },
        {
          label: "scanner",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "Scanner ${1:sc} = new Scanner(System.in);",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Scanner for input",
        },
        {
          label: "sysout",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "System.out.println(${1:});",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "System.out.println",
        },
      ],
      python: [
        {
          label: "input",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "${1:var} = input(${2:})",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Input statement",
        },
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "print(${1:})",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Print statement",
        },
        {
          label: "for",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ["for ${1:i} in range(${2:n}):", "\t${3:pass}"].join("\n"),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "For loop",
        },
      ],
      cpp: [
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "#include <iostream>",
            "using namespace std;",
            "",
            "int main() {",
            "\t${1:// Your code here}",
            "\treturn 0;",
            "}",
          ].join("\n"),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main function template",
        },
        {
          label: "cout",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "cout << ${1:} << endl;",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Console output",
        },
        {
          label: "cin",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "cin >> ${1:};",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Console input",
        },
      ],
    }

    if (snippets[lang]) {
      monaco.languages.registerCompletionItemProvider(monacoLanguage, {
        provideCompletionItems: () => ({
          suggestions: snippets[lang],
        }),
      })
    }
  }, [monacoLanguage])

  // Show loading state
  if (isLoading) {
    return (
      <div 
        style={{ height, width: "100%" }} 
        className="border border-border rounded-md bg-gray-50 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <div className="text-gray-500 text-sm">Loading editor...</div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div 
        style={{ height, width: "100%" }} 
        className="border border-border rounded-md bg-red-50 flex items-center justify-center"
      >
        <div className="text-red-500 text-center">
          <div className="text-sm font-medium mb-1">Editor Error</div>
          <div className="text-xs">{error}</div>
          <button 
            onClick={initializeEditor}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show editor
  return <div ref={editorRef} style={{ height, width: "100%" }} className="border border-border rounded-md" />
}

// Export with dynamic import and better loading
export default dynamic(() => Promise.resolve(CodeEditorComponent), {
  ssr: false,
  loading: () => (
    <div className="border border-border rounded-md bg-gray-50 flex items-center justify-center animate-pulse" style={{ height: "400px" }}>
      <div className="text-gray-500">Preparing editor...</div>
    </div>
  )
})
