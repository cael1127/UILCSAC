"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  theme?: string
  readOnly?: boolean
}

export default function CodeEditor({
  value,
  onChange,
  language,
  height = "400px",
  theme = "vs-dark",
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      // Configure Monaco Editor
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

      // Create the editor
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value,
        language: getMonacoLanguage(language),
        theme: theme === "vs-dark" ? "uil-dark" : "uil-light",
        readOnly,
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        minimap: { enabled: false },
        wordWrap: "on",
        tabSize: 2,
        insertSpaces: true,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        glyphMargin: false,
        contextmenu: true,
        mouseWheelZoom: true,
        smoothScrolling: true,
        cursorBlinking: "blink",
        cursorSmoothCaretAnimation: "on",
        renderLineHighlight: "line",
        selectOnLineNumbers: true,
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        suggest: {
          showKeywords: true,
          showSnippets: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
        },
      })

      // Handle content changes
      monacoRef.current.onDidChangeModelContent(() => {
        if (monacoRef.current) {
          onChange(monacoRef.current.getValue())
        }
      })

      // Add common code snippets
      addCodeSnippets(language)
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
      }
    }
  }, [])

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
        monaco.editor.setModelLanguage(model, getMonacoLanguage(language))
      }
      addCodeSnippets(language)
    }
  }, [language])

  // Update editor theme when prop changes
  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setTheme(theme === "vs-dark" ? "uil-dark" : "uil-light")
    }
  }, [theme])

  const getMonacoLanguage = (lang: string): string => {
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
    return languageMap[lang] || "plaintext"
  }

  const addCodeSnippets = (lang: string) => {
    // Add language-specific code snippets
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
      monaco.languages.registerCompletionItemProvider(getMonacoLanguage(lang), {
        provideCompletionItems: () => ({
          suggestions: snippets[lang],
        }),
      })
    }
  }

  return <div ref={editorRef} style={{ height, width: "100%" }} className="border border-border rounded-md" />
}
