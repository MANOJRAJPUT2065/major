'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/app/dashboard/components/Nav'
import CodeEditor from './components/CodeEditor'
import LexicalAnalyzer from './components/LexicalAnalysisPy'
import PythonParseTree from './components/PythonASTViewer'
import PythonToBytecode from './components/ByteCodePY'
import OptimizedPythonBytecode from './components/PtimisedByteCodePY'




const page = ({ params }: { params: Promise<{ id: string }> }) => {
    const [id, setId] = useState<string | null>(null)
    const [c, setC] = useState(`\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,)
    const [b, setB] = useState("")

    useEffect(() => {
        params.then(({ id }) => setId(id))
    }, [params])
    return (
        <div>
            <Navbar />
            <div className='grid grid-cols-2'>
               
                <div className=' min-h-screen flex flex-col '>
                    <CodeEditor setC={setC} ide={id}/>

                </div>
                <div className='min-h-screen'>
                    <LexicalAnalyzer code={c}/>
                    <PythonParseTree pythonCode={c}/>
                    <PythonToBytecode pythonCode={c} setB={setB}/>
                    <OptimizedPythonBytecode pythonCode={c} bytecode={b}/>
                </div>

                
                

            </div>
        </div>
    )
}
export default page