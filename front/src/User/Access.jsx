import { useState } from "react"
import Login from "./login";
import Register from "./register";

export default function Access(){
    const [state,setState] = useState("login");

    return(
        <div className="bg-custom-gray w-screen hide-scrollbar h-full flex">
         <div className="h-full w-full bg-custom-gray flex flex-col items-center justify-center">
            {state === 'login' ? <Login/> : <Register></Register> }  
            <a onClick={()=>{state === 'login' ? setState("register") : setState("login") }} className="text-lg text-indigo-400 cursor-pointer hover:underline">{state === 'login' ? 'Register' : 'Login'}</a>
        </div>
        </div>

    )
}