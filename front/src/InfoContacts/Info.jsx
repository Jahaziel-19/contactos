import { MdDelete, MdFirstPage } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
import PropTypes from 'prop-types';
import { useAuth } from "../User/AuthContext";

const Info = ({ info, onEdit }) => {
    const {token} = useAuth();
    const capitalizeFirstLetter = word => {
        const firstLetter = word.slice(0,1).toUpperCase(); 
        const restOfWord = word.slice(1,word.length);
        return firstLetter+restOfWord;
    };
    
    const handleDelete = async () =>{
        try{
            const res = await fetch(`http://127.0.0.1:5000/contacto/${info._id}`,{
                method: 'DELETE',
                headers:{
                    'Authorization' : `Bearer ${token}`
                },
            });

            if(!res.ok){
                console.log(await res.json());
                console.log('Error:',res.status );
            }
            console.log(await res.json());
        }catch(e){
            console.log(e);
        }
        window.location.reload();
    };

    return (
        <div className='bg-black h-full w-2/3 hide-scrollbar'>
            <div className={`w-full h-full bg-custom-gray flex justify-center items-start pt-20`}>
                <div className="w-2/3 h-4/5 bg-custom-gray flex flex-col justify-center items-center relative">
                    <div className="w-2/5 h-1/3 flex justify-center items-center relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-600 flex justify-center items-center text-white text-6xl">
                            {info.nombre.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <p title="number" className="text-black text-opacity-25">{info.telefono}</p>
                    <div className="bg-custom-gray w-5/6">
                        <p title="name" className="text-cyan-600 break-words text-center text-2xl">
                            {capitalizeFirstLetter(info.nombre)}
                        </p>
                    </div>
                    <div className="w-4/5 h-1/6 bg-custom-gray z-10 flex items-center justify-center gap-16 relative">
                        <div className="rounded-full bg-gradient-to-r from-indigo-400 to-cyan-600 h-10 flex items-center justify-center w-10 hover:cursor-pointer" 
                             onClick={onEdit}>
                            <MdModeEdit color="white" className="w-2/3 h-2/3" />
                        </div>
                        <div onClick={handleDelete}
                        className="rounded-full bg-gradient-to-r from-indigo-400 to-cyan-600 h-10 w-10 flex items-center justify-center hover:cursor-pointer">
                            <MdDelete color="white" className="w-2/3 h-2/3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Info.propTypes = {
    info: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default Info;
