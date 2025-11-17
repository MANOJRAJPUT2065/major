'use client'
import React, { useEffect, useState } from 'react'
import Navbar from './components/Nav'
import { Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import { getEmail } from "@/app/actions";


const page = () => {
  const [uuid, setUuid] = useState(uuidv4())
  const [sessions, setSessions] = useState([]);
  const [sessions2, setSessions2] = useState([]);
  const [email, setEmail] = useState("");
  const Router = useRouter()

  const handlePush = () => {
    const newId = uuidv4()
    setUuid(newId)
    Router.push(`/dashboard/${newId}`) //compiler
  }

  const handlePush2 = () => {
    const newId = uuidv4()
    setUuid(newId)
    Router.push(`/dashboard/interpreter/${newId}`)
  }

  const ondeletea = async (id: string) => {
    const res = await fetch(`/api/deleteComp?q=${id}`, { method: 'DELETE' });
    const datas = await res.json();
    if (datas.message == 'deleted') {
      setSessions(prevSessions => prevSessions.filter((session: { id: string }) => session.id !== id));
      toast.success("Session deleted successfully")
    } else {
      toast.error("Session not deleted. Try again")
    }

  };

  const ondeleteb = async (id: string) => {
    const res = await fetch(`/api/deleteInt?q=${id}`, { method: 'DELETE' });
    const datas = await res.json();
    if (datas.message == 'deleted') {
      setSessions2(prevSessions => prevSessions.filter((session: { id: string }) => session.id !== id));
      toast.success("Session deleted successfully")
    } else {
      toast.error("Session not deleted. Try again")
    }

  };

  useEffect(() => {
    getEmail().then((data) => {
      if (data && Array.isArray(data)) {
        const userEmail = data[0]?.emailAddress || "No email found";
        setEmail(userEmail);
        
        if (userEmail !== "No email found") {
          fetchComp(userEmail);
          fetchInt(userEmail);
        }
      }
    });
  }, []);
  
  const fetchComp = async (userEmail:string) => {
    
    const response = await fetch(`/api/getComp?q=${userEmail}`);
    const datas = await response.json();
    if (datas.message === 'match found') {
      setSessions(datas.res);
    }
  };
  
  const fetchInt = async (userEmail:string) => {
    
    const response = await fetch(`/api/getInt?q=${userEmail}`);
    const datas2 = await response.json();
    if (datas2.message === 'match found') {
      setSessions2(datas2.res);
    }
  };
  

  return (
    <div>
      <Navbar />


      <div className="flex min-h-screen">

        <div className="flex-1 p-8 border-r border-gray-300">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Compiler Visualization</h2>
            <button onClick={handlePush} className="w-full mb-8">
              <div className="border h-44 w-full rounded-lg bg-white flex items-center justify-center text-4xl hover:bg-gray-50 hover:scale-105 transition duration-300 ease-in-out shadow-md">
                +
              </div>
            </button>
            <div>
              <h3 className="text-2xl font-bold mb-6">Previous sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {sessions.map((session: { id: string }) => (
                  <PreviousSessionCard key={session.id} session={session} onDelete={ondeletea} />
                ))}

              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Interpreter Visualization</h2>
            <button onClick={handlePush2} className="w-full mb-8">
              <div className="border h-44 w-full rounded-lg bg-white flex items-center justify-center text-4xl hover:bg-gray-50 hover:scale-105 transition duration-300 ease-in-out shadow-md">
                +
              </div>
            </button>
            <div>
              <h3 className="text-2xl font-bold mb-6">Previous sessions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions2.map((sessions2: { id: string }) => (
                  <PreviousSessionCardb key={sessions2.id} session={sessions2} onDelete={ondeleteb} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



      <ToastContainer position="bottom-right" />

    </div>
  )
}


function PreviousSessionCard({ session, onDelete }: any) {
  return (
    <div className="relative w-full">
      <Link href={`/dashboard/${session.id}`} className="block">
        <div className="h-44 w-full rounded-2xl flex flex-col justify-start items-start bg-white shadow-lg group relative overflow-hidden p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <p className="text-sm font-semibold mb-3 text-gray-800 truncate w-full">Session ID: {session.id}</p>
          <pre className="text-xs text-gray-600 w-full overflow-hidden whitespace-pre-wrap break-words max-h-24 bg-gray-100 p-2 rounded-lg">
            {session.code.split('\n').slice(0, 3).join('\n')}
          </pre>
        </div>
      </Link>
      <button
        onClick={() => onDelete(session.id)}
        className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-opacity duration-300 shadow-md">
        <Trash2 size={18} />
      </button>
    </div>
  );
}



function PreviousSessionCardb({ session, onDelete }: any) {
  return (
    <div className="relative w-full">
      <Link href={`/dashboard/interpreter/${session.id}`} className="block">
        <div className="h-44 w-full rounded-2xl flex flex-col justify-start items-start bg-white shadow-lg group relative overflow-hidden p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <p className="text-sm font-semibold mb-3 text-gray-800 truncate w-full">Session ID: {session.id}</p>
          <pre className="text-xs text-gray-600 w-full overflow-hidden whitespace-pre-wrap break-words max-h-24 bg-gray-100 p-2 rounded-lg">
            {session.code.split('\n').slice(0, 3).join('\n')}
          </pre>
        </div>
      </Link>
      <button
        onClick={() => onDelete(session.id)}
        className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-opacity duration-300 shadow-md">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default page
