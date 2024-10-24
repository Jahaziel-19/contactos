import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from 'yup';

function Register({setState}) {
    const [formValues, setFormValues] = useState({
        name: '',
        number: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [check, setCheck] = useState(false);
    const navigate = useNavigate();

    const schema = yup.object().shape({
        name: yup.string()
            .matches(/^[a-zA-Z]*$/, 'Name cannot contain special characters or numbers.')
            .required('Name is required'),
        number: yup.number()
            .typeError('Number must be a valid number.')
            .positive('The number must be positive.'),
        email: yup.string()
            .email('Invalid email address.')
            .required('Email is required'),
        password: yup.string()
            .min(6, 'Password must be at least 6 characters.')
            .required('Password is required'),
    });
    const handleChange = async e => {
        const value = e.target.value;
        const name = e.target.name;
        setFormValues(values => ({ ...values, [name]: value }));

        try {
            await schema.validateAt(name, { ...formValues, [name]: value });
            setErrors(errors => ({ ...errors, [name]: '' }));
        } catch (error) {
            setErrors(errors => ({ ...errors, [name]: error.message }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const {email,name,number,password} = formValues;
            if(email.trim === '' || password.trim() === '' ||  number.trim() === '' || name.trim() === ''){
                setErrors(prev => ({ ...prev, general: 'Please fill all fields.' }));
                return;
            }
            console.log(formValues)
            await registerData(formValues);
        } catch (error) {
            setErrors(prev => ({ ...prev, general: error.message }));
        }
    };

    
    const registerData = async data => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            });

        if(!response.ok){
            const errorResponse = await response.json();
            console.error('Register failed:', errorResponse.message); 
            setErrors((prev) => ({ ...prev, general: errorResponse.message || 'Register failed. Please try again.' }));
            console.log(errors)
            return;
        }else{
            navigate('/');
        }
    }catch (e) {
        console.log(e);
    }
    }

    return (
        <div
        style={{ animation: 'slideInFromLeft 1s ease-out' }}
        className="max-w-md w-full bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-xl shadow-2xl overflow-hidden p-8 space-y-8"
    >
        <h2 className="text-center text-4xl font-extrabold text-white">
            Welcome
        </h2>
        <p className="text-center text-gray-200">
            Create an account
        </p>
        <form className="space-y-6">
            <div className="relative">
                <input
                    placeholder="number"
                    className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-white"
                    required
                    name="number"
                    type="number"
                    value={formValues.number}
                    onChange={handleChange}
                />
                <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-sm">
                    Number
                </label>
                {errors.number && <div className="text-red-500">{errors.number}</div>}
            </div>
            <div className="relative">
                <input
                    placeholder="Name"
                    className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-white"
                    required
                    name="name"
                    type="text"
                    value={formValues.name}
                    onChange={handleChange}
                />
                <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-sm">
                    Name
                </label>
                {errors.name && <div className="text-red-500">{errors.name}</div>}
            </div>
            <div className="relative">
                <input
                    placeholder="email"
                    className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-white"
                    required
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                />
                <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-sm">
                    Email
                </label>
                {errors.email && <div className="text-red-500">{errors.email}</div>}
            </div>
            <div className="relative">
                <input
                    placeholder="Password"
                    className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-white"
                    required
                    name="password"
                    type="password"
                    value={formValues.password}
                    onChange={handleChange}
                />
                <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-sm">
                    Password
                </label>
                {errors.password && <div className="text-red-500">{errors.password}</div>}
            </div>

            <button
                className="w-full py-2 px-4 bg-cyan-700 hover:bg-cyan-950 rounded-md shadow-lg text-white font-semibold transition duration-200"
                type="submit"
                onClick={handleSubmit}
            >
                Register
            </button>
        </form>
        <div className="text-center text-gray-300">
            Do you have an account?
            <a className="text-purple-300 hover:underline" href="#" onClick={setState}>Login</a>
        </div>
        {errors.general && <div className="text-red-500 text-center">{errors.general}</div>}
    </div>
    );
}

export default Register;

{/* <div className="h-5/6 w-1/3 bg-custom-gray rounded-3xl shadow-2xl border-indigo-400 border-2">
<form className="gap-12 w-full h-full flex flex-col items-center justify-center" onSubmit={handleSubmit}>
<h1 className="text-4xl text-indigo-400">Register</h1>
<div id="name-box" className="grid">
        <label htmlFor="name" className={animation.isAnimate && animation.label === 'name' ? "animation-label text-indigo-400" : 'opacity-0'}>Name</label>
        <input
            onChange={handleChange}
            name="name"
            placeholder='Name'
            type="text"
            className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onFocus={() => { setAnimation({ isAnimate: true, label: 'name' }) }}
        />
        {errors.name ? <div className="text-red-500">{errors.name}</div> : null}
    </div>
    
    <div id="name-box" className="grid">
        <label htmlFor="number" className={animation.isAnimate && animation.label === 'number' ? "animation-label text-indigo-400" : 'opacity-0'}>Number</label>
        <input
            onChange={handleChange}
            name="number"
            placeholder='Number'
            type="number"
            className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onFocus={() => { setAnimation({ isAnimate: true, label: 'number' }) }}
        />
        {errors.number ? <div className="text-red-500">{errors.number}</div> : null}
    </div>
    <div id="name-box" className="grid">
        <label htmlFor="email" className={animation.isAnimate && animation.label === 'email' ? "animation-label text-indigo-400" : 'opacity-0'}>Email</label>
        <input
            onChange={handleChange}
            name="email"
            placeholder='Email'
            type="email"
            className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onFocus={() => { setAnimation({ isAnimate: true, label: 'email' }) }}
        />
        {errors.email ? <div className="text-red-500">{errors.email}</div> : null}
    </div>

    <div id="name-box" className="grid">
        <label htmlFor="password" className={animation.isAnimate && animation.label === 'password' ? "animation-label text-indigo-400" : 'opacity-0'}>Password</label>
        <input
            name="password"
            placeholder='Password'
            type="password"
            className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleChange}
            onFocus={() => { setAnimation({ isAnimate: true, label: 'password' }) }}
        />
        {errors.password ? <div className="text-red-500">{errors.password}</div> : null}

        </div>
        

        <div id="name-box" className="grid">
        <label htmlFor="rpassword" className={animation.isAnimate && animation.label === 'rpassword' ? "animation-label text-indigo-400" : 'opacity-0'}>Repeat Password</label>
        <input
            name="rpassword"
            placeholder='Repeat Password'
            type="password"
            className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleChange}
            onFocus={() => { setAnimation({ isAnimate: true, label: 'rpassword' }) }}
        />
         {errors.rpassword ? <div className="text-red-500">{errors.rpassword}</div> : null}

        </div>
        


    
    <button
        type="submit"
        className="w-32 h-10 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-3xl text-white hover:from-indigo-500 hover:to-cyan-700 hover:text-xl"
    >
        Register
    </button>
</form>
</div> */}