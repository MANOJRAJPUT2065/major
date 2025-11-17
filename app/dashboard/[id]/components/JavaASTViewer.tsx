'use client'
import React, { useState } from "react";
import { Java9Lexer } from "@/parser/Java9Lexer";
import { Java9Parser } from "@/parser/Java9Parser";
import * as antlr4 from "antlr4ts";
import { CommonTokenStream } from "antlr4ts";
import { Tree } from "react-d3-tree";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chatSession } from "@/utils/GeminiAIModel";
import { Loader2 } from "lucide-react";

interface ASTNode {
  type: string;
  value?: string;
  position?: {
    line: number;
    column: number;
  };
  children: ASTNode[];
}

function displayAST(node: ASTNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  let output = `${indent}${node.type}`;

  if (node.value) {
    output += ` (${node.value})`;
  }

  if (node.position) {
    output += ` [L${node.position.line}:${node.position.column}]`;
  }

  output += '\n';

  for (const child of node.children) {
    output += displayAST(child, depth + 1);
  }

  return output;
}

const parseAST = (astString: string) => {
  const lines = astString.split("\n");
  const root = { name: "AST", children: [] };
  const stack = [{ node: root, depth: -1 }];

  lines.forEach((line) => {
    const match = line.match(/(\s*)([\w()]+.*)/);
    if (!match) return;

    const depth = match[1].length / 2;
    const name = match[2];
    const node = { name, children: [] };

    while (stack.length && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    stack[stack.length - 1].node.children.push(node);
    stack.push({ node, depth });
  });

  return root;
};

export function parseJavaToAST(code: string): string {
  const inputStream = new antlr4.ANTLRInputStream(code);
  const lexer = new Java9Lexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new Java9Parser(tokenStream);
  const tree = parser.compilationUnit();

  function processNode(node: any): ASTNode {
    const result: ASTNode = {
      type: node.constructor.name.replace(/Context$/, ''),
      children: []
    };

    if (node.symbol) {
      result.value = node.text;
      result.position = {
        line: node.symbol.line,
        column: node.symbol.charPositionInLine
      };
    }

    if (node.children) {
      for (const child of node.children) {
        if (child) {
          result.children.push(processNode(child));
        }
      }
    }

    return result;
  }

  const ast = processNode(tree);
  return displayAST(ast);
}

interface JavaASTViewerProps {
  code: string;
  language: 'java' | 'cpp';
}





const JavaASTViewer: React.FC<JavaASTViewerProps> = ({ code, language }) => {
  const [astResult, setAstResult] = useState<string>("");
  const [treeData, setTreeData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleParseClick = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      if (language === 'java') {
        const result = parseJavaToAST(code);
        setAstResult(result);
        setTreeData(parseAST(result));
      } else {
        const inputPrompt = `You are a compiler assistant. Generate a clean, hierarchical abstract syntax tree for the following C++ code. 
The response must be strict JSON without code fences and follow this schema:
{
  "name": "Root",
  "children": [
    { "name": "Child node", "children": [...] }
  ]
}

Include meaningful node names (e.g., "FunctionDeclaration", "ForLoop", "IfStatement") and keep the tree concise but representative. 
Code:
${code}`;

        const response = await chatSession.sendMessage(inputPrompt, undefined);
        const raw = response?.response?.text?.() ?? "";
        if (!raw) {
          throw new Error("Empty response from model");
        }
        const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        setTreeData(parsed);
        setAstResult("C++ AST generated via Gemini");
      }
      setIsOpen(true);
    } catch (error: any) {
      console.error("Error generating AST:", error);
      const message = error?.message ?? String(error);
      setErrorMessage(message);
      setTreeData(null);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col p-10 border m-5 rounded-lg">
      <div className="text-xl font-bold mb-2">Syntax Analysis</div>
        Syntax analysis is the process of checking if the code follows the correct structure or grammar of the programming language. It takes the tokens from lexical analysis and arranges them into a tree-like structure called a syntax tree. This helps ensure the code is written in a way that makes sense according to the language rules, like making sure parentheses match or a statement is properly formed.
        <div className="text-xl font-bold my-2">Symentic Analysis</div>
        Semantic analysis  goes a step further. It checks whether the code makes sense logically. For example, it ensures that variables are declared before being used, functions are called with the correct number of arguments, and types are compatible. While syntax checks the "form" of the code, semantic analysis checks the "meaning" behind it to make sure everything works together.
          
        <Button className="mt-3" onClick={handleParseClick} disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </span>
          ) : (
            "Parse Code"
          )}
        </Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4">
            <DialogTitle>Abstract Syntax Tree</DialogTitle>

          </DialogHeader>
          {errorMessage && (
            <div className="w-full h-full p-6">
              <p className="text-red-500 font-semibold">Failed to generate AST</p>
              <pre className="mt-3 whitespace-pre-wrap break-words text-sm bg-red-50 p-4 rounded border border-red-200">
                {errorMessage}
              </pre>
            </div>
          )}
          {treeData && !errorMessage && (
            <div className="w-full h-full p-4">
              <Tree
                data={treeData}
                orientation="vertical"
                translate={{ x: 400, y: 100 }}
                separation={{ siblings: 4, nonSiblings: 4 }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* <JavaASTToAssembly astString={astResult}/> */}
    </div>
  );
};

export default JavaASTViewer;
