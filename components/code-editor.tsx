import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

interface LineNumberProps {
  lineNumber: number;
  hasError?: boolean;
  hasWarning?: boolean;
}

const LineNumber: React.FC<LineNumberProps> = ({ lineNumber, hasError, hasWarning }) => (
  <div
    className={cn(
      "select-none text-right pr-3 text-xs font-mono text-[var(--muted-foreground)] border-r border-[var(--border)]",
      hasError && "bg-destructive/10 text-destructive",
      hasWarning && "bg-warning/10 text-warning"
    )}
  >
    {lineNumber}
  </div>
);

export default function CodeEditor({
  value,
  onChange,
  language = 'java',
  height = '400px',
  placeholder = 'Write your code here...',
  readOnly = false,
  className
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentColumn, setCurrentColumn] = useState(1);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);

  // Update line numbers when value changes
  useEffect(() => {
    const lines = value.split('\n');
    setLineNumbers(Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1));
  }, [value]);

  // Handle textarea changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Update cursor position
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    const lines = newValue.substring(0, cursorPosition).split('\n');
    setCurrentLine(lines.length);
    setCurrentColumn(lines[lines.length - 1].length + 1);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert 4 spaces for tab
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  // Handle textarea scroll to sync with line numbers
  const handleScroll = () => {
    if (textareaRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      // You could implement line number scrolling sync here
    }
  };

  // Increase font size
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
  };

  // Decrease font size
  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 10));
  };

  // Toggle word wrap
  const toggleWordWrap = () => {
    setWordWrap(!wordWrap);
  };

  return (
    <div className={cn("relative bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden shadow-lg", className)}>
      {/* Eclipse-style Editor Header */}
      <div className="bg-gradient-to-r from-[var(--muted)] to-[var(--muted)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Eclipse-style window controls */}
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer transition-colors"></div>
          </div>
          
          {/* File info */}
          <div className="ml-3 text-sm text-[var(--foreground)] font-medium">
            {language === 'java' ? 'Solution.java' : `file.${language}`}
          </div>
        </div>
        
        {/* Editor controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="px-2 py-1 text-xs bg-[var(--card)] border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
            title="Toggle line numbers"
          >
            {showLineNumbers ? 'Hide' : 'Show'} Lines
          </button>
          
          <button
            onClick={decreaseFontSize}
            className="px-2 py-1 text-xs bg-[var(--card)] border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
            title="Decrease font size"
          >
            A-
          </button>
          
          <button
            onClick={increaseFontSize}
            className="px-2 py-1 text-xs bg-[var(--card)] border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
            title="Increase font size"
          >
            A+
          </button>
          
          <button
            onClick={toggleWordWrap}
            className={cn(
              "px-2 py-1 text-xs border rounded transition-colors",
              wordWrap 
                ? "bg-blue-100 border-blue-300 text-blue-700" 
                : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]"
            )}
            title="Toggle word wrap"
          >
            Wrap
          </button>
          
          {/* Cursor position display */}
          <div className="text-xs text-[var(--muted-foreground)] bg-[var(--card)] px-2 py-1 rounded border border-[var(--border)]">
            Ln {currentLine}, Col {currentColumn}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex" style={{ height }}>
        {/* Line Numbers */}
        {showLineNumbers && (
          <div className="bg-[var(--muted)] border-r border-[var(--border)] overflow-hidden min-w-[60px]">
            {lineNumbers.map((lineNum) => (
              <LineNumber key={lineNum} lineNumber={lineNum} />
            ))}
          </div>
        )}

        {/* Code Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            readOnly={readOnly}
            placeholder={placeholder}
            className={cn(
              "w-full h-full p-4 font-mono resize-none outline-none",
              "bg-[var(--card)] text-[var(--foreground)]",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "leading-6",
              readOnly && "bg-[var(--muted)] cursor-not-allowed"
            )}
            style={{
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              tabSize: 4,
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre'
            }}
          />
        </div>
      </div>

      {/* Eclipse-style Status Bar */}
      <div className="bg-gradient-to-r from-[var(--muted)] to-[var(--muted)] px-4 py-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-4">
          <span className="font-medium">{language.toUpperCase()}</span>
          <span>UTF-8</span>
          <span>{lineNumbers.length} lines</span>
          <span>Spaces: 4</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Font: {fontSize}px</span>
          <span>Word Wrap: {wordWrap ? 'On' : 'Off'}</span>
          <span>Ln {currentLine}, Col {currentColumn}</span>
        </div>
      </div>

      {/* Eclipse-style Right Panel (can be expanded) */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-[var(--muted)] border-l border-[var(--border)] transform translate-x-full transition-transform duration-300 hover:translate-x-0 group">
        <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]">
          <h3 className="text-sm font-medium text-[var(--foreground)]">Outline</h3>
        </div>
        <div className="p-3">
          <div className="text-xs text-[var(--muted-foreground)]">
            <div className="mb-2">• Solution (class)</div>
            <div className="ml-4 mb-1">• main(String[] args)</div>
            <div className="ml-4 text-[var(--muted-foreground)]">• String name</div>
            <div className="ml-4 text-[var(--muted-foreground)]">• int number</div>
          </div>
        </div>
        
        {/* Hover indicator */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 bg-blue-500 text-smoky-black text-xs px-2 py-1 rounded-l opacity-0 group-hover:opacity-100 transition-opacity">
          Outline
        </div>
      </div>
    </div>
  );
}

