import { useState } from "react";
import { useAuth } from "../User/AuthContext";

function Navbar({setData}){
    const {token} = useAuth();
    const fecthData = async param =>{
    try{    
        if(param.trim() === ""){
                try {
                    const response = await fetch(`http://127.0.0.1:5000/contactos`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setData(data);
                    }
                } catch (e) {
                    console.log(e);
                }
            return;
        };

        const response = await fetch(`http://127.0.0.1:5000/contactos/buscar/${param}`, {
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });

        if(!response.ok){
            console.log(response.status);
        }
        const data = await response.json();
        setData(data);
    }catch (e) {
        console.log(e);
    }

    }
    const handleChange = e =>{
        const {value} = e.target;
        console.log(value);
        fecthData(value);
    }
    
    return(
        <div className='bg-gradient-to-r from-indigo-400 to-cyan-600 w-full h-16 flex items-center justify-center'>
            <input
                onChange={handleChange}
              className="rounded-full bg-violet-100 text-xl border-2 w-4/5 h-1/2 p-4 placeholder-cyan-600 focus:text-violet-950 focus:border-cyan-600 focus:outline-none  focus:ring-cyan-300"
              placeholder="Busca entre tus contactos..."
            />
        </div>
    )
}

export default Navbar;