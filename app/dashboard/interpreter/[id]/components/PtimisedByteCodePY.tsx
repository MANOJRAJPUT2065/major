'use client'
import React, { useState } from 'react';
import { chatSession } from '@/utils/GeminiAIModel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OptimizedPythonBytecodeProps {
    code: string;
    bytecode: string;
    language: 'python' | 'cpp';
}

const OptimizedPythonBytecode: React.FC<OptimizedPythonBytecodeProps> = ({ code, bytecode, language }) => {
    const [loading, setLoading] = useState(false);
    const [optimizedBytecode, setOptimizedBytecode] = useState('');
    const [open, setOpen] = useState(false);

    const generateOptimizedBytecode = async () => {
        setLoading(true);
        const languageLabel = language === 'cpp' ? 'C++' : 'Python';
        const key = language === 'cpp' ? 'optimized_representation' : 'optimized_bytecode';
        const instruction = language === 'cpp'
            ? `Optimize the following ${languageLabel} low-level representation (or inferred bytecode) to reduce redundant operations, improve execution efficiency, and follow best practices for the language/runtime.`
            : `Optimize the following Python bytecode to reduce redundant operations, improve execution efficiency, and follow best practices.`;

        const inputPrompt =  `${instruction}

${languageLabel} Source Code:
${code}

Current Bytecode / Representation:
${bytecode}

Return the optimized result strictly in the following JSON format without any additional text or code blocks:
{
  "${key}": "Optimized ${languageLabel} bytecode or representation here."
}

Ensure the optimized output accurately represents the original program. If the input contains errors, describe them inside the ${key} field itself.`;
        try {
            const result = await chatSession.sendMessage(inputPrompt);
            const rawResponse = result.response.text();
            if (!rawResponse) {
                throw new Error('No response received from API');
            }
            const cleanResponse = rawResponse.replace(/```json/gi, '').replace(/```/g, '');
            const parsedResponse = JSON.parse(cleanResponse);
            const optimized = parsedResponse[key] ?? parsedResponse.optimized_bytecode ?? parsedResponse.optimized_representation;
            if (!optimized) {
                throw new Error('Model response missing optimized bytecode field');
            }
            setOptimizedBytecode(optimized);
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
                setOptimizedBytecode(
                    '⚠️ Gemini service is overloaded.\n\nThis usually resolves in a minute—please retry shortly.'
                );
            } else if (normalizedMessage.includes('quota') || normalizedMessage.includes('429') || normalizedMessage === 'api_quota_exceeded') {
                setOptimizedBytecode(
                    '⚠️ API Quota Exceeded\n\n' +
                    'The Gemini API free tier quota has been exceeded.\n\n' +
                    'Solutions:\n' +
                    '1. Wait a few minutes and try again\n' +
                    '2. Get a new API key from https://aistudio.google.com/app/apikey\n' +
                    '3. Upgrade to a paid plan for higher quotas'
                );
            } else {
                setOptimizedBytecode('Error generating optimized bytecode: ' + message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col p-10 border m-5 rounded-lg">
                <h1 className="text-xl font-bold mb-2">{language === 'cpp' ? 'Optimized C++ Representation' : 'Optimized Python Bytecode Generation'}</h1>
                <p>{language === 'cpp'
                    ? 'The compiled representation of C++ can be optimized to reduce redundant instructions, streamline control flow, and improve execution efficiency.'
                    : 'Python bytecode can be optimized to reduce redundant operations, improve execution efficiency, and adhere to best practices, ensuring faster performance and reduced memory usage.'}</p>
                <Button onClick={() => setOpen(true)} className="mt-3">
                    Open Optimizer
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="p-4">{language === 'cpp' ? 'Optimized C++ Representation' : 'Optimized Bytecode Generation'}</DialogTitle>
                    </DialogHeader>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-gray-300 text-sm overflow-auto max-h-60 border border-gray-700">
                        <pre>{code}</pre>
                    </div>
                    
                    <Button 
                        onClick={generateOptimizedBytecode} 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg" 
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Optimize Bytecode'}
                    </Button>
                    {optimizedBytecode && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Optimized {language === 'cpp' ? 'C++ Representation' : 'Python Bytecode'}:</h2>
                            <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-green-400 text-sm min-h-80 max-h-96 overflow-y-auto border border-gray-700">
                                <pre className="whitespace-pre-wrap break-words">{optimizedBytecode}</pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OptimizedPythonBytecode;
