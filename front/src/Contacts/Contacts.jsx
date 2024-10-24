import Navbar from './Navbar';
import Info from '../InfoContacts/Info';
import EditContact from '../InfoContacts/EditContact'; // Asegúrate de importar el componente EditContact
import { useEffect, useState } from 'react';
import { useAuth } from '../User/AuthContext';

function Contacts() {
    const { token,modalExport,setModalExport } = useAuth();
    const [info, setInfo] = useState(null);
    const [dataUsers, setData] = useState([]);
    const [isEditing, setIsEditing] = useState(false); 

    useEffect(() => {
        console.log('hola');
        fetchData();
    }, []);
    const handleDownloadCSV = async () => {
      try {
          const response = await fetch(`http://127.0.0.1:5000/contactos/export/csv`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              throw new Error('Error al descargar el archivo CSV');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'contactos.csv'; 
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
      } catch (error) {
          console.error(error);
          alert('Error al descargar el archivo CSV.'); 
      }
  };
    const exportContactsJSON = async () =>{
      try{
        const res = await fetch(`http://127.0.0.1:5000/contactos/export/json`,{
          method:'GET',
          headers:{
            'Authorization' : `Bearer ${token}`
          }
        });

        if(!res.ok){
          console.log(await res.json());
          console.log('export failed.');
        }

        const data = await res.json();
          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
      
          const a = document.createElement('a');
          a.href = url;
          a.download = 'data.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      
      }catch(e){
        console.log(e);
      }
    };

    const fetchData = async () => {
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
                console.log(data);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const capitalizeFirstLetter = word => {
      const firstLetter = word.slice(0,1).toUpperCase(); 
      const restOfWord = word.slice(1,word.length);
      return firstLetter+restOfWord;
  };
    const handleEdit = () => {
        setIsEditing(true);
    };

    return (
        <div className='w-screen h-full bg-custom-gray flex'>
          {modalExport ? (
            <div 
            className="fixed inset-0 bg-black opacity-50">
            </div>
          ):null}
        {

              <div
                role="alert"
                className={`mx-auto max-w-lg  border border-stone bg-stone-100 p-4 sm:p-6 lg:p-8 w-2/5 h-56 absolute  top-52 left-96 shadow-lg rounded-md ${modalExport ? 'z-50' : 'hidden'}`}
              >
                <div class="flex  items-center gap-4 justify-between">
                  <p class="font-medium sm:text-lg text-cyan-600">Export Contacts</p>
                    <div className='w-8 h-8 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-full flex justify-center items-center hover:cursor-pointer text-white'
                      onClick={()=>{
                        setModalExport(false)
                      }}
                    > <p>X</p></div>
                </div>

                <p class="mt-4 text-gray-600">
                  Export your contacts in JSON or CSV format.
                </p>
                

                <div class="mt-6 sm:flex sm:gap-4">
                  <a
                    href="#"
                    class="inline-block w-full rounded-lg bg-gradient-to-r from-indigo-400 to-cyan-600 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
                    onClick={()=>{
                      exportContactsJSON();
                    }}
                  >
                    JSON
                  </a>

                  <a
                    href="#"
                    class="mt-2 inline-block w-full rounded-lg bg-stone-300 px-5 py-3 text-center text-sm font-semibold text-gray-800 sm:mt-0 sm:w-auto"
                    onClick={()=>{
                      handleDownloadCSV();
                    }}
                  >
                    CSV
                  </a>
                </div>
            </div> 
            

        }
            <div className='bg-slate-600 h-full w-2/5'>
                <Navbar setData={setData} />
                <div className='bg-custom-white h-[calc(100%-4rem)] overflow-y-auto scrollbar-thumb-cyan-600 scrollbar-track-white scrollbar-thin'>
                    {
                        dataUsers.length !== 0 ?
                        dataUsers.map((person, index) => (
                            <div key={index} onClick={() => {
                                setInfo(person);
                                setIsEditing(false); 
                            }} 
                                className='bg-custom-white h-1/6 flex items-center pl-6 border-custom border-cyan-600 hover:bg-custom-gray cursor-pointer'>
                                <div className='bg-gradient-to-r from-indigo-400 to-cyan-600 w-14 h-14 flex justify-center items-center rounded-full text-white text-2xl'>{person.nombre.charAt(0).toUpperCase()}</div>
                                <h2 className='pl-6 text-cyan-600 text-xl'>{capitalizeFirstLetter(person.nombre)}</h2>
                            </div>
                        ))
                        :
                        <div className='h-full w-full flex justify-center items-center'>
                          <h1 className='text-cyan-600'>No contacts yet. Add one!</h1>
                        </div>
                    }
                </div>
            </div>
            {isEditing ? (
                <EditContact info={info} />
            ) : info !== null ? (
                <Info info={info} onEdit={handleEdit} />
            ) : 
            <div className='flex justify-center items-center h-full w-full'>
              <h1 className='text-cyan-600'>¡Welcome to your contact schedule!</h1>
            </div>
            }
        </div>
    );
}

export default Contacts;
