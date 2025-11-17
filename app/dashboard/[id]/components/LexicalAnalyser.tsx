'use client'
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface LexicalAnalyzerProps {
  code: string;
  language: 'java' | 'cpp';
}

interface Token {
  type: string;
  value: string;
}

const LexicalAnalyzer: React.FC<LexicalAnalyzerProps> = ({ code, language }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isOpen, setIsOpen] = useState(false);


  const javaKeywords = [
    // Basic Keywords
    "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue",
    "default", "do", "double", "else", "enum", "extends", "final", "finally", "float", "for", "goto", "if",
    "implements", "import", "instanceof", "int", "interface", "long", "native", "new", "null", "package",
    "private", "protected", "public", "return", "short", "static", "strictfp", "super", "switch", "synchronized",
    "this", "throw", "throws", "transient", "try", "void", "volatile", "while", "util",

    // Common Libraries
    "java", "java.util", "java.util.Arrays", "java.util.List", "java.util.Set", "java.util.Map", "java.util.HashMap",
    "java.util.HashSet", "java.util.ArrayList", "java.util.LinkedList", "java.util.Queue", "java.util.Stack",
    "java.util.Iterator", "java.util.Date", "java.util.Calendar", "java.util.Random", "java.util.Scanner",
    "java.util.Collections", "java.util.stream", "java.util.function", "java.util.concurrent", "java.util.concurrent.atomic",
    "java.util.concurrent.locks", "java.util.concurrent.ExecutorService", "java.util.concurrent.Executors", "java.util.concurrent.Future",
    "java.util.Optional", "java.util.Properties", "java.util.regex", "java.util.Timer", "java.util.TimerTask",
    "java.util.UUID", "java.util.concurrent.locks.ReentrantLock", "java.util.concurrent.locks.Lock", "java.util.concurrent.locks.Condition",

    // Annotations
    "@Override", "@Deprecated", "@SuppressWarnings", "@FunctionalInterface", "@SafeVarargs",
    "@Target", "@Retention", "@Documented", "@Inherited",

    // Common Methods
    "toString", "equals", "hashCode", "clone", "finalize",

    // Common Classes
    "System", "System.out", "Math", "String", "Integer", "Double", "Float", "Character",
    "Boolean", "Long", "Short", "BigDecimal", "BigInteger", "Arrays", "List", "Set", "Map",
    "HashMap", "HashSet", "ArrayList", "LinkedList", "Stream", "Collectors", "Optional",

    // Advanced Constructs
    "synchronized", "volatile", "strictfp", "transient",

    // Lambda and Streams
    "->", "::", "filter", "map", "reduce", "forEach",

    // Reflection
    "Field", "Method", "Constructor", "Class", "Modifier"
  ];

  const cppKeywords = [
    "alignas", "alignof", "and", "and_eq", "asm", "atomic_cancel", "atomic_commit", "atomic_noexcept",
    "auto", "bitand", "bitor", "bool", "break", "case", "catch", "char", "char8_t", "char16_t",
    "char32_t", "class", "compl", "concept", "const", "consteval", "constexpr", "constinit", "const_cast",
    "continue", "co_await", "co_return", "co_yield", "decltype", "default", "delete", "do", "double",
    "dynamic_cast", "else", "enum", "explicit", "export", "extern", "false", "float", "for", "friend",
    "goto", "if", "inline", "int", "long", "mutable", "namespace", "new", "noexcept", "not", "not_eq",
    "nullptr", "operator", "or", "or_eq", "private", "protected", "public", "reflexpr", "register",
    "reinterpret_cast", "requires", "return", "short", "signed", "sizeof", "static", "static_assert",
    "static_cast", "struct", "switch", "template", "this", "thread_local", "throw", "true", "try",
    "typedef", "typeid", "typename", "union", "unsigned", "using", "virtual", "void", "volatile",
    "wchar_t", "while", "xor", "xor_eq",

    // Common headers and std symbols
    "std", "cout", "cin", "endl", "vector", "string", "map", "unordered_map", "set", "unordered_set",
    "queue", "stack", "deque", "list", "array", "tuple", "optional", "variant", "filesystem",
    "chrono", "thread", "mutex", "lock_guard", "unique_lock", "shared_ptr", "unique_ptr", "make_shared",
    "make_unique", "move", "forward", "begin", "end", "rbegin", "rend"
  ];

  useEffect(() => {
    const keywords = language === 'cpp' ? cppKeywords : javaKeywords;
    const analyzeCode = () => {
      const codeTokens: Token[] = [];
      const regex = /\b(\w+)\b|(["'](?:\\.|[^"'])*["'])|([\+\-\*\/\=\!\<\>\&\|\^\%\~]+)|([\(\)\{\}\[\];,\.])/g;
      let match;

      while ((match = regex.exec(code)) !== null) {
        const [_, word, string, operator, delimiter] = match;

        if (word && keywords.includes(word)) {
          codeTokens.push({ type: "Keyword", value: word });
        } else if (word && !isNaN(Number(word))) {
          codeTokens.push({ type: "Number", value: word });
        } else if (string) {
          codeTokens.push({ type: "String", value: string });
        } else if (word) {
          codeTokens.push({ type: "Identifier", value: word });
        } else if (operator) {
          codeTokens.push({ type: "Operator", value: operator });
        } else if (delimiter) {
          codeTokens.push({ type: "Delimiter", value: delimiter });
        }
      }

      setTokens(codeTokens);
    };

    analyzeCode();
  }, [code, language]);


  const groupedTokens = tokens.reduce((acc, token) => {
    if (!acc[token.type]) {
      acc[token.type] = [];
    }
    acc[token.type].push(token.value);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div>
      <div className="flex flex-col p-10 border m-5 rounded-lg">
        <div className="text-xl font-bold mb-2">Lexical Analysis</div>
        Lexical analysis is the first step in processing code. It takes raw text (like a programming script) and breaks it into small, meaningful pieces called tokens. These tokens represent keywords, numbers, symbols, or identifiers in the code. A program called a lexer or scanner does this job, helping the computer understand the code structure before further processing, like parsing.

      <Button className="mt-3" onClick={() => setIsOpen(true)}>Analyze Code</Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-xl w-[90vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4">
            <DialogTitle>Lexical Analysis</DialogTitle>

          </DialogHeader>

          {Object.keys(groupedTokens).length > 0 && (
            <div className="w-full h-full p-4 overflow-auto">
              <table className="table-auto w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(groupedTokens).map((type) => (
                      <th key={type} className="px-4 py-2 border">{type}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.values(groupedTokens).map((values, index) => (
                      <td key={index} className="px-4 py-2 border align-top">
                        {values.map((value, idx) => (
                          <div key={idx}>{value}</div>
                        ))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexicalAnalyzer;
