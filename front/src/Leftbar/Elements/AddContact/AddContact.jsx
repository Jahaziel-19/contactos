import { useState } from "react"
import * as yup from 'yup';


export default function AddContact(){
const [animation,setAnimation] = useState({isAnimate:false,label:null});

  const [formValues, setFormValues] = useState({
    name: '',
    number: '',
    email: '',
    general:''
  })
const [errors,setErrors] = useState({
});
const [check,setCheck] = useState(false);

const onAnimation = (obj) => {
  setAnimation(obj);
}
const firstLetter = (name) =>{
  return name.slice(0,1);
}
const schema = yup.object().shape({
    name: yup.string()
    .matches(/^[a-zA-Z]*$/, 'Name cannot contain special characters or numbers.')
    .required('Name is required'),
    number: yup.number()
    .typeError('Number must be a valid number.')
    .positive('The number must be positive.')
    .required('Number is required.'),
    email: yup.string()
    .email('Invalid email address.')
    .required('Email is required')
})

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
    console.log(errors);
    console.log(formValues);
  }

  const handleSubmit = e =>{
    e.preventDefault();
    const {name,email,number} = errors;
    console.log(name)
    if(name!=='' || email !== '' || number !== ''){
        setErrors(values => ({...values,general : 'Fill well all the fields.'}));
        return;
    }
    setErrors(values => ({...values,general : ''}));
    setCheck(true);

  }

    return(
      <div className="bg-custom-gray w-screen hide-scrollbar h-full flex">
        <div className="h-full w-full bg-custom-gray flex flex-col items-center justify-center">
          <div className="bg-custom-gray h-5/6 w-4/5 flex flex-col items-center justify-center">
            <div className="bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-full w-32 h-32 flex items-center justify-center">
              <p className="text-6xl text-white">{firstLetter(formValues.name)}</p>
            </div>
            <div className="h-3/4 w-3/4 bg-custom-gray">
              <form className="gap-10 w-full h-full flex flex-col items-center justify-center">
                <div id="name-box" className="grid ">
                  <label htmlFor="name" className={animation.isAnimate && animation.label === 'name' ? "animation-label text-indigo-400" : 'opacity-0'}>Name</label>
                  <input name="name" placeholder='Name' type="text" className="bg-custom-gray border h-10 rounded-3xl text-lg p-4   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} onFocus={()=>{onAnimation({isAnimate:true,label:'name'})}} />
                  {errors.name ? <div className="text-red-500 ">{errors.name}</div> : null}
                </div>
                <div id="name-box" className="grid">
                <label htmlFor="number" className={animation.isAnimate && animation.label === 'number' ? "animation-label text-indigo-400" : 'opacity-0'}>Number</label>
                <input onChange={handleChange} name="number" placeholder='Number' type="number" className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2  focus:ring-blue-500 focus:border-blue-500 " onFocus={()=>{onAnimation({isAnimate:true,label:'number'})}} />
                {errors.number ? <div className="text-red-500 ">{errors.number}</div> : null}

                </div>
                <div id="name-box" className="grid">
                <label htmlFor="email" className={animation.isAnimate && animation.label === 'email' ? "animation-label text-indigo-400" : 'opacity-0'}>Email</label>
                <input onChange={handleChange} name="email" placeholder='Email' type="text" className="bg-custom-gray border h-10 rounded-3xl text-lg p-4  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " onFocus={()=>{onAnimation({isAnimate:true,label:'email'})}} />
                {errors.email && <div className="text-red-500 ">{errors.email}</div>}
                </div>
                <button type="submit" className="w-32 h-10 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-3xl text-white hover:from-indigo-500 hover:to-cyan-700 hover:text-xl" onClick={handleSubmit}>Add</button>
                {errors.general ? <div className="text-red-500 ">{errors.general}</div> : check ? <div className="text-green-500 ">Contact added successfully.</div> : null}              
                </form>
            </div>
          </div> 
        </div>

      </div>
    )
  }
