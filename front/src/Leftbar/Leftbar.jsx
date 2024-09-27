import { CiExport } from "react-icons/ci";
import { IoMoonOutline } from "react-icons/io5";
import { CiSettings } from "react-icons/ci";
import {  useState } from 'react';
import { IoIosAdd } from "react-icons/io";
import { LuContact } from "react-icons/lu";
import {  useNavigate } from "react-router-dom";
import { useAuth } from "../User/AuthContext";

export default function Leftbar(){
      const {user} = useAuth();
      const Navigate = useNavigate();
      const [selected,setSelected] = useState(
        {
          isSelected: false,
          logo: null
        }
      )
      const handleClick = (obj,action) =>{
        setSelected(obj);
        console.log(action);
        if(action==='add'){
          Navigate('/add-contact');
        }else if(action==='contacts'){
          Navigate('/contacts');
        }
      }
        const animationLogos = obj => {
          console.log(obj);
        }
    return (
        <div className='hide-scrollbar h-full bg-indigo-400 w-20 rounded-xl'>
        <div className='flex flex-col gap-8 items-center pt-1'>
        <div  onClick={()=>{handleClick({isSelected:false,logo:null},'add')}} className="w-16 h-16 hover:cursor-pointer bg-white rounded-full flex justify-center items-center shadow-xl">
          <IoIosAdd color="#3f51b5" className="w-12 h-12 hover:w-16 hover:h-16 rotate-on-hover" />
        </div>
        { selected.isSelected && selected.logo === 'contact' ?
          <div className='bg-white hover:cursor-pointer h-full w-4/5 flex items-center justify-center rounded-md shadow-xl pt-1 pb-1'>
          <div className='w-9 h-9 pt-2 pb-2 flex items-center justify-center'><LuContact onClick={() => {handleClick({isSelected:true,logo:'contact'},'contacts')}} onMouseEnter={()=>{animationLogos({isSelected: true,  logo: 'contact'})}} className='w-9 h-9' color='#3f51b5' /></div>              
          </div>
          : 
          <div className='hover:w-10 hover:cursor-pointer hover:h-10 w-8 h-8pt-2 pb-2 flex items-center justify-center'><LuContact onClick={() => {handleClick({isSelected:true,logo:'contact'},'contacts')}}  onMouseEnter={()=>{animationLogos({isSelected: true, logo: 'contact'})}} onMouseLeave={()=>{animationLogos({isSelected: false, logo: null})}} className='w-8 h-8 hover:w-9 hover:h-9' color='white'/></div>   
        }
        { selected.isSelected && selected.logo === 'export' ?
          <div className='bg-white hover:cursor-pointer h-full w-4/5 flex items-center justify-center rounded-md shadow-xl pt-1 pb-1'>
          <div className='w-9 h-9 pt-2 pb-2 flex items-center justify-center'><CiExport onClick={() => {handleClick({isSelected:true,logo:'export'})}} onMouseEnter={()=>{animationLogos({isSelected: true,  logo: 'export'})}} className='w-9 h-9' color='#3f51b5' /></div>              
          </div>
          : 
          <div className='hover:w-10 hover:cursor-pointer hover:h-10 w-8 h-8pt-2 pb-2 flex items-center justify-center'><CiExport onClick={() => {handleClick({isSelected:true,logo:'export'})}} onMouseEnter={()=>{animationLogos({isSelected: true, logo: 'export'})}} onMouseLeave={()=>{animationLogos({isSelected: false, logo: null})}} className='w-8 h-8 hover:w-9 hover:h-9' color='white'/></div>   
        }
         { selected.isSelected && selected.logo === 'dark' ?
          <div className='bg-white hover:cursor-pointer h-full w-4/5 flex items-center justify-center shadow-xl rounded-md pt-1 pb-1 '>
          <div className='w-9 h-9 pt-2 pb-2 flex items-center justify-center'><IoMoonOutline onClick={() => {handleClick({isSelected:true,logo:'dark'})}} onMouseEnter={()=>{animationLogos({isSelected: true,  logo: 'dark'})}} className='w-10 h-10' color='#4f46e5' /></div>              
          </div>
          : 
          <div className='hover:w-10  hover:cursor-pointer hover:h-10 w-8 h-8 pt-2 pb-2 flex items-center justify-center'><IoMoonOutline onClick={() => {handleClick({isSelected:true,logo:'dark'})}} onMouseEnter={()=>{animationLogos({isSelected: true, logo: 'dark'})}} onMouseLeave={()=>{animationLogos({isSelected: false, logo: null})}} className='w-8 h-8 hover:w-9 hover:h-9' color='white' /></div>    
        }
        { selected.isSelected && selected.logo === 'settings' ?
          <div className='bg-white hover:cursor-pointer h-full w-4/5 flex items-center justify-center shadow-xl rounded-md pt-1 pb-1'>
          <div className='w-9 h-9 pt-2 pb-2 flex items-center justify-center'><CiSettings onClick={() => {handleClick({isSelected:true,logo:'settings'})}} onMouseEnter={()=>{animationLogos({isSelected: true,  logo: 'settings'})}} className='w-10 h-10' color='#4f46e5' /></div>              
          </div>
          : 
          <div className='hover:w-10 hover:cursor-pointer hover:h-10 w-8 h-8 pt-2 pb-2 flex items-center justify-center'><CiSettings onClick={() => {handleClick({isSelected:true,logo:'settings'})}} onMouseEnter={()=>{animationLogos({isSelected: true, logo: 'settings'})}} onMouseLeave={()=>{animationLogos({isSelected: false, logo: 'settings'})}} className='w-10 h-10' color='white'/></div>   
        }
        {
          <h1>{user}</h1>
        }

        </div>  
        
      </div>
    )
}