'use client'
import React, { useState } from 'react'
import { chatSession } from '@/utils/GeminiAIModel'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface JavaToAssemblyProps {
  code: string
  language: 'java' | 'cpp'
}

const JavaToAssembly: React.FC<JavaToAssemblyProps> = ({ code: sourceCode, language }) => {
  const [loading, setLoading] = useState(false)
  const [assemblyCode, setAssemblyCode] = useState('')
  const [open, setOpen] = useState(false)

  const languageLabel = language === 'cpp' ? 'C++' : 'Java'

  const generateAssembly = async () => {
    setLoading(true)
    setAssemblyCode('')
    const inputPrompt = `Convert the following ${languageLabel} code into single-pass Assembly-like intermediate representation.
${languageLabel} Code:
${sourceCode}

Ensure that the result follows a single-pass compilation approach and adheres to standard Assembly syntax conventions for ${languageLabel}. Return the output strictly in the following JSON format without any additional text or code blocks:

{
  "assembly": "Generated Assembly code here."
}

Also analyze the code. If there are any errors mention them inside the assembly field itself.`

    try {
      const result: any = await chatSession.sendMessage(inputPrompt)
      let rawResponse = ''

      if (result && typeof result === 'object') {
        if (result.response && typeof result.response.text === 'function') {
          rawResponse = await result.response.text()
        } else if (typeof result.text === 'function') {
          rawResponse = await result.text()
        } else {
          rawResponse = JSON.stringify(result)
        }
      } else {
        rawResponse = String(result)
      }

      let jsonString: string | null = null
      const fencedJson = rawResponse.match(/```json\s*([\s\S]*?)```/i)
      if (fencedJson && fencedJson[1]) {
        jsonString = fencedJson[1].trim()
      } else {
        const objMatch = rawResponse.match(/({[\s\S]*})/)
        if (objMatch && objMatch[1]) jsonString = objMatch[1].trim()
      }

      if (!jsonString) {
        setAssemblyCode('Could not parse JSON from model response. Raw response:\n\n' + rawResponse.slice(0, 20000))
        return
      }

      let parsed: any
      try {
        parsed = JSON.parse(jsonString)
      } catch (parseErr) {
        setAssemblyCode('Failed to parse JSON from model. Extracted text:\n\n' + jsonString.slice(0, 20000))
        return
      }

      const assemblyOut = parsed.assembly ?? parsed.code ?? parsed.output ?? JSON.stringify(parsed, null, 2)
      setAssemblyCode(String(assemblyOut))
    } catch (error: any) {
      const message = error?.message ?? String(error)
      let parsed: any = null
      try {
        parsed = typeof message === 'string' ? JSON.parse(message) : null
      } catch (_) {
        parsed = null
      }
      const normalizedMessage = message.toLowerCase()
      if (normalizedMessage.includes('models/') && normalizedMessage.includes('not found')) {
        setAssemblyCode(
          'Model error from Google Generative API: model not found or not supported for the method used. Please check the model name in your GeminiAIModel config and call ListModels to see available models & methods.'
        )
      } else if (
        parsed?.error?.code === 503 ||
        parsed?.error?.status === 'UNAVAILABLE' ||
        normalizedMessage.includes('unavailable') ||
        normalizedMessage.includes('overloaded')
      ) {
        setAssemblyCode(
          '⚠️ Gemini service is overloaded.\n\n' +
          'The selected model is temporarily unavailable. Please wait a moment and retry.\n\n' +
          'Hints:\n' +
          '• Try again in 30-60 seconds\n' +
          '• Reduce prompt size if possible\n' +
          '• Switch to another Gemini model if you have access'
        )
      } else if (normalizedMessage.includes('quota') || normalizedMessage.includes('429') || normalizedMessage === 'api_quota_exceeded') {
        setAssemblyCode(
          '⚠️ API Quota Exceeded\n\n' +
          'The Gemini API free tier quota has been exceeded. This could be due to:\n' +
          '• Too many requests in a short time\n' +
          '• Daily/monthly limit reached\n\n' +
          'Solutions:\n' +
          '1. Wait a few minutes and try again (quota resets periodically)\n' +
          '2. Get a new API key from https://aistudio.google.com/app/apikey\n' +
          '3. Upgrade to a paid plan for higher quotas\n\n' +
          'Error details: ' + message
        )
      } else {
        setAssemblyCode('Error generating assembly code: ' + message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col p-10 border m-5 rounded-lg">
        <h1 className="text-xl font-bold mb-2">Intermediate Code Generation ({languageLabel})</h1>
        <p>
          Single-pass intermediate code generation is a compiler phase where source code is transformed into a
          streamlined, low-level representation in a single traversal. It avoids backtracking, making it efficient but
          limiting optimization. Common formats include postfix notation and stack-based code, ensuring quick translation
          to assembly while maintaining syntactic correctness.
        </p>
        <Button onClick={() => setOpen(true)} className="mt-3">
          Open Converter
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="p-4">Intermediate Code Generation ({languageLabel})</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-gray-300 text-sm overflow-auto max-h-60 border border-gray-700">
            <pre>{sourceCode}</pre>
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
  )
}

export default JavaToAssembly
