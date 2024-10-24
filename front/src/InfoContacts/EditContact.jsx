import * as yup from 'yup';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../User/AuthContext';

const EditContact = ({info}) =>{
    const {token} = useAuth();
    const [formValues, setFormValues] = useState({
        nombre: info.nombre,
        telefono: info.telefono,
        email: info.email,
      });
    const [animation,setAnimation] = useState({isAnimate:false,label:null});
    const handleChange = async e => {
        const value = e.target.value;
        const name = e.target.name;
        setFormValues(values=>({...values,[name] : value}));

        try{
          await schema.validateAt(name,{...formValues,[name] : value});
          setErrors(errors=>({...errors,[name] : ''}))
        }catch (error){
          setErrors(errors=>({...errors,[name] : error.message}));
        }
        console.log(formValues);
      };
      const editData = async person =>{
        try{
            const res = await fetch(`http://127.0.0.1:5000/contacto/${info._id}`,{
                method: "PUT",
                headers:{
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`,
                },
                body: JSON.stringify(formValues)
            });
            if(!res.ok){
                console.log(await res.json());
                console.log("No se puedo editar.");
            }
            console.log(res.json);
        }catch (e){
            console.log(e);
        }
    }
      const handleSubmit = e =>{
        e.preventDefault();
        const {nombre,email,telefono} = formValues;
        if(nombre=== '' || email === '' || telefono === ''){
            setErrors(values => ({...values,general : 'Fill well all the fields.'}));
            return;
        }
        setErrors(values => ({...values,general : ''}));
        setCheck(true);
        editData(formValues);
        window.location.reload();
      }
    const [errors,setErrors] = useState({
    });
    const [check,setCheck] = useState(false);
    
    const onAnimation = (obj) => {
      setAnimation(obj);
    }
    const schema = yup.object().shape({
        nombre: yup.string()
        .matches(/^[a-zA-Z\s]*$/, 'Name cannot contain special characters or numbers.')
        .required('Name is required'),
        telefono: yup.number()
        .typeError('Number must be a valid number.')
        .positive('The number must be positive.')
        .required('Number is required.'),
        email: yup.string()
        .email('Invalid email address.')
        .required('Email is required')
    });
const capitalizeFirstLetter = (name) =>{
        return name.slice(0,1).toUpperCase();
}
    return(
<div className="bg-custom-gray w-full hide-scrollbar h-full flex">
        <div className="h-full w-full bg-custom-gray flex flex-col items-center justify-center">
          <div className="bg-custom-gray h-5/6 w-4/5 flex flex-col items-center justify-center">
            <div className="bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-full w-32 h-32 flex items-center justify-center">
              <p className="text-6xl text-white">{capitalizeFirstLetter(formValues.nombre)}</p>
            </div>
            <div className="h-3/4 w-3/4 bg-custom-gray">
              <form className="mt-10 gap-10 w-full h-full flex flex-col items-center justify-center">
                <div id="name-box" className="grid ">
                  <label htmlFor="nombre" className={animation.isAnimate && animation.label === 'nombre' ? 'animation-label text-indigo-400' : 'opacity-0'}>Name</label>
                  <input value={formValues.nombre} onChange={handleChange} name="nombre" placeholder='Name' type="text" className="bg-custom-gray border h-10 rounded-3xl text-lg p-4   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"  onFocus={()=>{onAnimation({isAnimate:true,label:'nombre'})}} />
                  {errors.nombre ? <div className="text-red-500 ">{errors.nombre}</div> : null}
                </div>
                <div id="name-box" className="grid">
                <label htmlFor="telefono" className={animation.isAnimate && animation.label === 'telefono' ? "animation-label text-indigo-400" : 'opacity-0'}>Number</label>
                <input value={formValues.telefono} onChange={handleChange} name="telefono" placeholder='Number' type="number" className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2  focus:ring-blue-500 focus:border-blue-500 " onFocus={()=>{onAnimation({isAnimate:true,label:'telefono'})}} />
                {errors.telefono ? <div className="text-red-500 ">{errors.telefono}</div> : null}

                </div>
                <div id="name-box" className="grid">
                <label htmlFor="email" className={animation.isAnimate && animation.label === 'email' ? "animation-label text-indigo-400" : 'opacity-0'}>Email</label>
                <input value={formValues.email} onChange={handleChange} name="email" placeholder='Email' type="text" className="bg-custom-gray border h-10 rounded-3xl text-lg p-4  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " onFocus={()=>{onAnimation({isAnimate:true,label:'email'})}} />
                {errors.email && <div className="text-red-500 ">{errors.email}</div>}
                </div>
                <button onClick={handleSubmit} type="submit" className="w-32 h-10 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-3xl text-white hover:from-indigo-500 hover:to-cyan-700 hover:text-xl" >Edit</button>
                {errors.general ? <div className="text-red-500 ">{errors.general}</div> : check ? <div className="text-green-500 ">Contact edited successfully.</div> : null}              
                </form>
            </div>
          </div> 
        </div>

      </div>
    )
}

EditContact.propTypes = {
    info: PropTypes.object.isRequired, 
};

export default EditContact;