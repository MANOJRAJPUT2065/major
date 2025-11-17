'use client'
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LexicalAnalyzerProps {
  code: string;
}

interface Token {
  type: string;
  value: string;
}

const LexicalAnalyzer: React.FC<LexicalAnalyzerProps> = ({ code }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const pythonKeywords = [
    "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import",
    "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while",
    "with", "yield", "match", "case",

    // Common Libraries
    "sys", "os", "math", "random", "time", "datetime", "json", "re", "collections", "itertools",
    "functools", "heapq", "bisect", "copy", "pprint", "traceback", "argparse", "subprocess", "threading",
    "multiprocessing", "socket", "struct", "base64", "hashlib", "hmac", "secrets", "pickle", "sqlite3",
    "csv", "configparser", "logging", "shutil", "glob", "tempfile", "zipfile", "tarfile", "importlib",
    "http", "urllib", "xml", "email", "cgi", "cgitb", "wsgiref", "uuid", "dataclasses", "typing",
    "pathlib", "statistics", "decimal", "fractions", "unicodedata", "enum", "inspect", "abc",

    // Common Methods
    "open", "print", "input", "len", "range", "map", "filter", "zip", "sorted", "enumerate", "sum",
    "min", "max", "round", "type", "dir", "id", "hex", "bin", "oct", "format", "repr", "eval",

    // Built-in Data Types
    "int", "float", "complex", "list", "tuple", "set", "dict", "frozenset", "str", "bytes", "bytearray",
    "memoryview", "bool", "object", "Ellipsis", "NotImplemented",

    // Advanced Constructs
    "@staticmethod", "@classmethod", "@property", "@dataclass", "@abstractmethod", "@lru_cache",

    // Decorators & Functions
    "super", "__init__", "__new__", "__call__", "__repr__", "__str__", "__iter__", "__next__",
    "__getitem__", "__setitem__", "__delitem__", "__contains__", "__eq__", "__ne__", "__lt__",
    "__le__", "__gt__", "__ge__", "__add__", "__sub__", "__mul__", "__truediv__", "__floordiv__",
    "__mod__", "__pow__", "__and__", "__or__", "__xor__", "__lshift__", "__rshift__", "__invert__",
    "__len__", "__bool__", "__hash__", "__copy__", "__deepcopy__",

    // Asynchronous Programming
    "asyncio", "EventLoop", "Task", "Future", "coroutine", "gather", "sleep", "run"
  ];

  useEffect(() => {
    const analyzeCode = () => {
      const codeTokens: Token[] = [];
      const regex = /\b(\w+)\b|(["'](?:\\.|[^"'])*["'])|([\+\-\*\/\=\!\<\>\&\|\^\%\~]+)|([\(\)\{\}\[\];,\.])/g;
      let match;

      while ((match = regex.exec(code)) !== null) {
        const [_, word, string, operator, delimiter] = match;

        if (word && pythonKeywords.includes(word)) {
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
  }, [code]);

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
