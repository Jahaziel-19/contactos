import { MdDelete } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
import { useParams } from "react-router-dom";


function Info() {
    const {id} = useParams();

    return (
        <div className="w-full h-full bg-custom-gray flex justify-center items-start pt-20">
            <div className="w-2/3 h-4/5 bg-custo,-gray flex flex-col justify-center items-center bottom-10 relative">
                 <div className=" w-2/5 h-1/3 flex justify-center items-center bottom-10 relative">
                     <div className=" w-32 h-32 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"></div>
                </div>
                <p className="text-black bottom-7 relative text-opacity-25" >{`numero de contacto ${id}`}</p>
                <div className="bg-custom-gray w-5/6  bottom-7 relative">
                    <p className="text-cyan-500  break-words text-center text-2xl" >{`nombre de contacto ${id}`}</p>
                    </div>

                <div className=" w-4/5 h-1/6 bg-custom-gray z-10 flex items-center justify-center gap-16 bottom-4 relative">
                    <div className="rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 h-10 flex items-center justify-center w-10"><MdModeEdit color="white" className="w-2/3 h-2/3"></MdModeEdit></div>
                    <div className="rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 h-10 w-10 flex items-center justify-center"><MdDelete color="white" className="w-2/3 h-2/3"></MdDelete></div>
                </div>
            </div>
        </div>
    );
}

export default Info;
