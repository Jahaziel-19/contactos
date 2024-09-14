// import Info from "../InfoContacts/Info";
import { useNavigate } from 'react-router-dom';


function Contacts(){
    const contacts = [
        { name: 'Juan Pérez', number: 1 },
        { name: 'Ana Gómez', number: 2 },
        { name: 'Luis Martínez', number: 3 },
        { name: 'Marta Fernández', number: 4 },
        { name: 'Carlos Rodríguez', number: 5 },
        { name: 'Laura Sánchez', number: 6 },
        { name: 'Pedro López', number: 7 },
        { name: 'Sofía Morales', number: 8 },
        { name: 'Ricardo Ruiz', number: 9 },
        { name: 'Elena Castillo', number: 10 },
        { name: 'Jorge Vargas', number: 11 },
        { name: 'Patricia Ortega', number: 12 },
        { name: 'Antonio Fernández', number: 13 },
        { name: 'Isabel Martínez', number: 14 },
        { name: 'Miguel Ángel Gómez', number: 15 },
        { name: 'Carmen Delgado', number: 16 },
        { name: 'Fernando Sánchez', number: 17 },
        { name: 'Beatriz Moreno', number: 18 },
        { name: 'Roberto Pérez', number: 19 },
        { name: 'Cristina López', number: 20 }
      ];
    const navigate = useNavigate();
  const fristLetter = (name) =>{
    return name.slice(0,1);
  }

  const info = (id) =>{
    navigate(`/contact/${id}`);
    
  }

    return(
        <div className='bg-custom-gray h-[calc(100%-4rem)] overflow-y-auto  scrollbar-thumb-cyan-400 scrollbar-track-white scrollbar-thin'>
        {
            contacts.map( (person,index) => 
              (
                <div key={index} onClick={()=>{info(person.number)}} className='bg-custom-white h-1/6 flex items-center pl-6 border-custom border-cyan-500 hover:bg-custom-gray cursor-pointer'> 
                <div className='bg-gradient-to-r from-indigo-400 to-cyan-400 w-14 h-14 flex justify-center items-center rounded-full text-white text-2xl'>{fristLetter(person.name)}</div>
                <h2 className='pl-6 text-cyan-500 text-xl'>{person.name}</h2>
              </div>))
        }
      </div>
    )
}

export default Contacts;