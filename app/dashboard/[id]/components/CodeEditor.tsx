'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import LanguageSelector from './LanguageSelector';
import { Loader2, PlayIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEmail } from "@/app/actions";
import { ToastContainer, toast } from 'react-toastify';

export const LANGUAGE_VERSIONS: { [key: string]: string } = {
    java: "15.0.2",
    cpp: "10.2.0",
};

const CODE_SNIPPETS: { [key: string]: string } = {
    java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n`,
};


interface CodeEditorProps {
    setC: (code: string) => void;
    ide: string | null;
    onLanguageChange?: (language: string) => void;
    initialLanguage?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ setC, ide, onLanguageChange, initialLanguage = 'java' }) => {
    const editorRef = useRef<any>(null);
    const initial = (initialLanguage in CODE_SNIPPETS ? initialLanguage : 'java') as 'java' | 'cpp';
    const [language, setLanguage] = useState<'java' | 'cpp'>(initial);
    const [value, setValue] = useState(CODE_SNIPPETS[initial]);
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false)
    const [loadingb, setLoadingb] = useState(false)
    const [error, setError] = useState(false)
    const [id, setId] = useState(ide)
    const [email, setEmail] = useState("");

    const handleSave = async () => {
        const data = {
            id: id,
            code: value,
            email: email,
        }

        try {
            setLoadingb(true)

            const response = await fetch(`/api/save?q=${id}`);
            const datas = await response.json();

            if (datas.message == "match not found") {
                try {
                    const response = await fetch('/api/save', {
                        method: "POST",
                        body: JSON.stringify(data),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })

                    const result = await response.json();
                    if (result.message == "Data saved successfully") {
                        toast.success("Code saved successfully")
                    }
                } catch (error) {
                    console.error("Error saving data:", error);
                    toast.error("Code not saved")
                }
            } else {
                try {
                    const response = await fetch('/api/save', {
                        method: "PUT",
                        body: JSON.stringify(data),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })

                    const result = await response.json();
                    if (result.message == "Data updated successfully") {
                        toast.success("Code updated successfully")
                    }
                } catch (error) {
                    console.error("Error updating data:", error);
                    toast.error("Code not updated")
                }
            }

        } catch (err) {
            console.error("Error fetching data:", error);
        }finally {
            setLoadingb(false)
        }


    }


    useEffect(() => {
        setId(ide);
        getEmail().then((data) => {
            if (data && Array.isArray(data)) {
                setEmail(data[0]?.emailAddress || "No email found");
            }
        });

        const handleInitialCode = async () => {
            const response = await fetch(`/api/save?q=${ide}`);
            const datas = await response.json();

            if (datas.res && Array.isArray(datas.res) && datas.res.length > 0) {
                setValue(datas.res[0].code);
                setC(datas.res[0].code);
            } else {
                console.log("No code found");
            }
        };

        handleInitialCode();
    }, [ide]);



    const onMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    useEffect(() => {
        if (initialLanguage && initialLanguage !== language && initialLanguage in CODE_SNIPPETS) {
            const normalized = initialLanguage as 'java' | 'cpp';
            const snippet = CODE_SNIPPETS[normalized];
            setLanguage(normalized);
            setValue(snippet);
            setC(snippet);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLanguage]);

    const onSelect = (nextLanguage: 'java' | 'cpp') => {
        const fallbackLanguage = CODE_SNIPPETS[nextLanguage] ? nextLanguage : 'java';
        setLanguage(fallbackLanguage);
        const snippet = CODE_SNIPPETS[fallbackLanguage];
        setValue(snippet);
        setC(snippet);
        onLanguageChange?.(fallbackLanguage);
    };

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        console.log(id)
        if (!sourceCode) return;

        try {
            setLoading(true)
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: language,
                    version: LANGUAGE_VERSIONS[language],
                    files: [{ content: sourceCode }],
                }),
            });

            const result = await response.json();


            if (result.error) {
                console.error('Execution Error:', result.error);
                setOutput(`Error: ${result.error}`);
            } else {
                console.log('Execution Output:', result.run.output);
                setOutput(result.run.output);
                result.run.stderr ? setError(true) : setError(false)
            }
        } catch (error: any) {
            console.error('Error executing code:', error);
            setOutput(`Error executing code: ${error.message}`);
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="min-h-screen border-r fixed w-1/2">
            <p className="mx-5 my-5 text-xl font-semibold">Code Editor</p>
            <div className="border p-3 mb-5 mx-5 rounded-lg">
                <div className="flex justify-between items-center">
                    <LanguageSelector language={language} onSelect={onSelect} />
                    <div className='flex justify-center items-center gap-3'>
                        <Button
                         onClick={handleSave} 
                         className='flex justify-center items-center bg-blue-500 p-3 text-white rounded-md hover:bg-blue-600 mb-2 text-sm gap-2'
                         disabled={loadingb}
                         >
                            {loadingb ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className='animate-spin' />
                                    <span>saving..</span>
                                </div>
                            ) : (
                                <>
                                    Save Code <Save/>
                                </>
                            )}
                        </Button>
                        <button
                            onClick={runCode}
                            className="flex justify-center items-center bg-green-500 p-2 text-white rounded-md hover:bg-green-600 mb-2 text-sm gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className='animate-spin' />
                                    <span>Loading..</span>
                                </div>
                            ) : (
                                <>
                                    Run Code <PlayIcon />
                                </>
                            )}
                        </button>
                    </div>

                </div>
                <Editor
                    height="45vh"
                    theme="vs-dark"
                    language={language}
                    defaultValue={CODE_SNIPPETS[language]}
                    onMount={onMount}
                    value={value}
                    onChange={(newValue: any) => { setValue(newValue || ''); setC(newValue || '') }}
                />
            </div>
            <div className="min-h-[18rem] border m-5 rounded-lg">
                <div className="text-xl font-semibold bg-gray-200 p-3">Output</div>
                {error ? <pre className="whitespace-pre-wrap break-words p-3 bg-red-200">{output}</pre> : <pre className="whitespace-pre-wrap break-words p-3">{output}</pre>}
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default CodeEditor;
