'use client'
import React, { useState } from 'react';
import { chatSession } from '@/utils/GeminiAIModel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Tree from 'react-d3-tree';

interface PythonParseTreeProps {
    pythonCode: string;
}

const PythonParseTree: React.FC<PythonParseTreeProps> = ({ pythonCode }) => {
    const [loading, setLoading] = useState(false);
    const [parseTree, setParseTree] = useState<any>(null);
    const [open, setOpen] = useState(false);

    const generateParseTree = async () => {
        setLoading(true);
        const inputPrompt = `Ensure that the response is always in strict JSON format without unnecessary text or formatting issues. This is top priority. Generate a parse tree for the following Python code and return it in JSON format. If the code is difficult make sure to understand the context and return a simpler parse tree for the program in the JSON format:

Python Code:
${pythonCode}

Return the output strictly in the following JSON format:
{
  "name": "Root",
  "children": [
    { "name": "Child1", "children": [...] },
    { "name": "Child2" }
  ]
}
`;

        try {
            const result = await chatSession.sendMessage(inputPrompt);
            const rawResponse = result.response.text();
            if (!rawResponse) {
                throw new Error('No response from API');
            }
            const cleanResponse = rawResponse.replace('```json', '').replace('```', '');
            const parsedResponse = JSON.parse(cleanResponse);
            setParseTree(parsedResponse);
        } catch (error: any) {
            console.error('Error processing request:', error);
            const message = error?.message ?? String(error);
            let parsed: any = null;
            try {
                parsed = typeof message === 'string' ? JSON.parse(message) : null;
            } catch (_) {
                parsed = null;
            }
            const normalizedMessage = message.toLowerCase();
            if (
                parsed?.error?.code === 503 ||
                parsed?.error?.status === 'UNAVAILABLE' ||
                normalizedMessage.includes('unavailable') ||
                normalizedMessage.includes('overloaded')
            ) {
                setParseTree({
                    name: '⚠️ Gemini service is overloaded',
                    children: [
                        { name: 'Wait a moment and try again' },
                        { name: 'Heavy traffic can cause temporary delays' }
                    ]
                });
            } else if (normalizedMessage.includes('quota') || normalizedMessage.includes('429') || normalizedMessage === 'api_quota_exceeded') {
                setParseTree({
                    name: '⚠️ API Quota Exceeded',
                    children: [
                        { name: 'Wait a few minutes and retry' },
                        { name: 'Or get a new API key' }
                    ]
                });
            } else {
                setParseTree(null);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col p-10 border m-5 rounded-lg">
                <h1 className="text-xl font-bold mb-2">Parse Tree Generator</h1>
                    <p>A parse tree visually represents the syntactic structure of a given Python code snippet, illustrating how individual tokens are grouped and organized according to predefined grammar rules, helping in understanding the hierarchical relationships between different elements of the code.</p>
                <Button onClick={() => setOpen(true)} className="mt-3">
                    Open Parse Tree Generator
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="p-4">Python Parse Tree</DialogTitle>
                    </DialogHeader>
                    <Button
                        onClick={generateParseTree}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Parse Tree'}
                    </Button>
                    <div className="w-full flex-grow mt-4 p-4 overflow-hidden">
                        {parseTree ? (
                            <div style={{ width: '100%', height: '100%' }}>
                                <Tree
                                    data={parseTree}
                                    orientation="vertical"
                                    translate={{ x: 400, y: 100 }}
                                    separation={{ siblings: 4, nonSiblings: 4 }}
                                />
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No parse tree available. Click "Generate Parse Tree" to create one.</p>
                        )}
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PythonParseTree;
