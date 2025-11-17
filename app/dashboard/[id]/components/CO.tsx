'use client'
import React, { useState } from 'react';
import { chatSession } from '@/utils/GeminiAIModel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JavaToThreePassProps {
    code: string;
    language: 'java' | 'cpp';
}

const JavaToThreePass: React.FC<JavaToThreePassProps> = ({ code, language }) => {
    const [loading, setLoading] = useState(false);
    const [assemblyCode, setAssemblyCode] = useState('');
    const [open, setOpen] = useState(false);

    const languageLabel = language === 'cpp' ? 'C++' : 'Java';

    const extractJson = (text: string) => {
        const withoutFences = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = withoutFences.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : null;

        if (!jsonString) {
            return { json: null, raw: withoutFences, error: 'No JSON object found in model response.' };
        }

        try {
            return { json: JSON.parse(jsonString), raw: withoutFences, error: null };
        } catch (err: any) {
            return { json: null, raw: withoutFences, error: err?.message ?? String(err) };
        }
    };

    const generateAssembly = async () => {
        setLoading(true);
        const inputPrompt = `Convert the following ${languageLabel} code into three-pass Assembly language:\n  
\n${languageLabel} Code:\n${code}\n  
\nEnsure that the Assembly code follows a three-pass compilation approach and adheres to standard Assembly syntax for ${languageLabel}. If the code is highly complex (such as involving recursion, backtracking, or intricate logic), return a simplified gist of how the Assembly code would be structured, highlighting key sections like stack management, function calls, and loop handling.\n  
\nReturn the output strictly in the following JSON format without any additional text or code blocks:\n  
\n{  
  "assembly": "Generated Assembly code here"  
}\n  
\nThis must ensure that the response is always in a strict JSON format without unnecessary text or formatting issues.
`;
        try {
            const result = await chatSession.sendMessage(inputPrompt);
            const rawResponse = result.response.text();
            if (!rawResponse) {
                throw new Error('No response from API');
            }
            const cleanResponse = rawResponse.replace(/```json/gi, '').replace(/```/g, '');
            const { json, error, raw } = extractJson(cleanResponse);

            if (!json || error) {
                setAssemblyCode(
                    '⚠️ Unable to parse model response as JSON.\n\n' +
                    'Details: ' + error + '\n\n' +
                    'Model output preview:\n' +
                    raw.slice(0, 2000) + (raw.length > 2000 ? '\n…' : '')
                );
                return;
            }

            const assembly = json.assembly ?? json.code ?? json.output;
            if (!assembly) {
                setAssemblyCode(
                    '⚠️ Model response did not include an "assembly" field.\n\n' +
                    'Model output:\n' +
                    JSON.stringify(json, null, 2)
                );
                return;
            }

            setAssemblyCode(String(assembly));
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
                setAssemblyCode(
                    '⚠️ Gemini service is overloaded.\n\n' +
                    'Google reports temporary high load on this model.\n\n' +
                    'Suggestions:\n' +
                    '1. Wait a short while and try again\n' +
                    '2. Retry with a smaller prompt\n' +
                    '3. Switch models if available'
                );
            } else if (normalizedMessage.includes('quota') || normalizedMessage.includes('429') || normalizedMessage === 'api_quota_exceeded') {
                setAssemblyCode(
                    '⚠️ API Quota Exceeded\n\n' +
                    'The Gemini API free tier quota has been exceeded.\n\n' +
                    'Solutions:\n' +
                    '1. Wait a few minutes and try again\n' +
                    '2. Get a new API key from https://aistudio.google.com/app/apikey\n' +
                    '3. Upgrade to a paid plan for higher quotas'
                );
            } else {
                setAssemblyCode('Error generating assembly code: ' + message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col p-10 border m-5 rounded-lg">
                <h1 className="text-xl font-bold mb-2">Three-Pass Assembly Code Generation ({languageLabel})</h1>
                <p>Three-pass assembly code generation refines the source code through multiple traversals. The first pass collects label addresses, the second pass resolves symbolic references, and the third pass generates the final machine code. This method ensures optimization and accuracy in the compiled output.</p>
                <Button onClick={() => setOpen(true)} className="mt-3">
                    Open Converter
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="p-4">Three-Pass Assembly Code Generation ({languageLabel})</DialogTitle>
                    </DialogHeader>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-gray-300 text-sm overflow-auto max-h-60 border border-gray-700">
                        <pre>{code}</pre>
                    </div>
                    <Button
                        onClick={generateAssembly}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Convert to Assembly'}
                    </Button>
                    {assemblyCode && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Generated Assembly Code:</h2>
                            <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-green-400 text-sm min-h-80 max-h-96 overflow-y-auto border border-gray-700">
                                <pre className="whitespace-pre-wrap break-words">{assemblyCode}</pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JavaToThreePass;