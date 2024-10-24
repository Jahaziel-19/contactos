import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from 'yup';
import { useAuth } from "./AuthContext";

function Login({ onLogin ,setState}) {
    const { login, token, logout } = useAuth(); 
    const [formValues, setFormValues] = useState({
        password: '',
        phone_number: '',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const schema = yup.object().shape({
        phone_number: yup.string()
            .required('Phone number is required.')
            .matches(/^\d+$/, 'Phone number must be digits only.'),
        password: yup.string()
            .min(6, 'Password must be at least 6 characters.')
            .required('Password is required.')
    });

    useEffect(() => {
        if (token) {
            logout();
        }
    }, [token, logout]);

    const handleChange = async e => {
        const { name, value } = e.target;
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
            await schema.validate(formValues, { abortEarly: false });
            await loginData();
        } catch (validationErrors) {
            const newErrors = {};
            validationErrors.inner.forEach(err => {
                newErrors[err.path] = err.message;
            });
            setErrors(newErrors);
        }
    };

    const loginData = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValues) 
            });
            
            if (!response.ok) {
                const errorResponse = await response.json();
                setErrors(prev => ({ ...prev, general: errorResponse.message || 'Login failed. Please try again.' }));
                return;
            }
            
            const responseJson = await response.json();
            sessionStorage.setItem('token', responseJson.access_token);
            login(formValues.phone_number, responseJson.access_token); 
            navigate('/contacts');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div
            style={{ animation: 'slideInFromLeft 1s ease-out' }}
            className="max-w-md w-full bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-xl shadow-2xl overflow-hidden p-8 space-y-8"
        >
            <h2 className="text-center text-4xl font-extrabold text-white">
                Welcome
            </h2>
            <p className="text-center text-gray-200">
                Login
            </p>
            <form className="space-y-6" >
                <div className="relative">
                    <input
                        placeholder="Phone Number"
                        className="peer h-10 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-white"
                        required
                        name="phone_number"
                        type="text"
                        value={formValues.phone_number}
                        onChange={handleChange}
                    />
                    <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-sm">
                        Phone Number
                    </label>
                    {errors.phone_number && <div className="text-red-500">{errors.phone_number}</div>}
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
                    Login
                </button>
            </form>
            <div className="text-center text-gray-300">
                Don't have an account?
                <a className="text-purple-300 hover:underline" href="#" onClick={setState}>Register</a>
            </div>
            {errors.general && <div className="text-red-500 text-center">{errors.general}</div>}
        </div>
    );
}

export default Login;


            // <div className="h-2/3 w-1/3 bg-custom-gray rounded-3xl shadow-2xl border-indigo-400 border-2">
            //     <form className="gap-16 w-full h-full flex flex-col items-center justify-center" onSubmit={handleSubmit}>
            //     <h1 className="text-4xl text-indigo-400">Login</h1>
            //         <div id="name-box" className="grid">
            //             <label htmlFor="number" className={animation.isAnimate && animation.label === 'number' ? "animation-label text-indigo-400" : 'opacity-0'}>Number</label>
            //             <input
            //                 onChange={handleChange}
            //                 name="phone_number"
            //                 placeholder='Number'
            //                 type="number"
            //                 className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            //                 onFocus={() => { setAnimation({ isAnimate: true, label: 'number' }) }}
            //             />
            //         </div>
            //         {errors.number ? <div className="text-red-500">{errors.number}</div> : null}

            //         <div id="name-box" className="grid">
            //             <label htmlFor="password" className={animation.isAnimate && animation.label === 'password' ? "animation-label text-indigo-400" : 'opacity-0'}>Password</label>
            //             <input
            //                 name="password"
            //                 placeholder='Password'
            //                 type="password"
            //                 className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            //                 onChange={handleChange}
            //                 onFocus={() => { setAnimation({ isAnimate: true, label: 'password' }) }}
            //             />
            //                 {errors.password ? <div className="text-red-500">{errors.password}</div> : null}
            //             </div>

            //         <button
            //             onClick={loginData}
            //             type="submit"
            //             className="w-32 h-10 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-3xl text-white hover:from-indigo-500 hover:to-cyan-700 hover:text-xl"
            //         >
            //             Login
            //         </button>
            //     </form>
            // </div>