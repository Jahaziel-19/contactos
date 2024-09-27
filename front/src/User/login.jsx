import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from 'yup';
import { useAuth } from "./AuthContext";

function Login({onLogin}) {
    const { login } = useAuth(); 
    const [animation, setAnimation] = useState({ isAnimate: false, label: null });
    const [formValues, setFormValues] = useState({
        password: '',
        number: '',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [check,setCheck] = useState(false);
    const schema = yup.object().shape({
        number: yup.number()
            .positive('The number must be positive.')
            .typeError('Number must be a valid number.'),
        password: yup.string()
            .min(6, 'Password must be at least 6 characters.')
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

    const handleSubmit = e => {
        e.preventDefault();
        const { password, number } = errors;
        if ( password !== '' || number !== '') {
            setErrors(values => ({ ...values, general: 'Fill well all the fields.' }));
            return;
        }
        setErrors(values => ({ ...values, general: '' }));
        onLogin('hola');
        console.log('antes de la ruta');
        setCheck(true);
        loginData(formValues);
    };

    const loginData = async data => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            });

        if(!response.ok){
            const errorResponse = await response.json();
            console.error('Login failed:', errorResponse.message); 
            setErrors((prev) => ({ ...prev, general: errorResponse.message || 'Login failed. Please try again.' }));
            console.log(errors)
            return;
        }else{
            const userData = await response.json();
            login(userData); 
            navigate('/contacts');
        }
    }catch (e) {
        console.log(e);
    }
    }
    return (
                <div className="h-2/3 w-1/3 bg-custom-gray rounded-3xl shadow-2xl border-indigo-400 border-2">
                    <form className="gap-16 w-full h-full flex flex-col items-center justify-center" onSubmit={handleSubmit}>
                    <h1 className="text-4xl text-indigo-400">Login</h1>
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
                        </div>
                        {errors.number ? <div className="text-red-500">{errors.number}</div> : null}

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


                        


                        
                        <button
                            type="submit"
                            className="w-32 h-10 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-3xl text-white hover:from-indigo-500 hover:to-cyan-700 hover:text-xl"
                        >
                            Login
                        </button>
                    </form>
                </div>
    );
}

export default Login;


// const handleSubmit = async e => {
//     e.preventDefault();
//     const { number, password } = formValues;

//     // Validación de errores
//     if (!number || !password) {
//         setErrors(values => ({ ...values, general: 'Please fill in all fields.' }));
//         return;
//     }

//     try {
//         // Aquí deberías llamar a tu API para autenticar al usuario
//         const response = await api.login({ number, password });

//         if (response.success) {
//             // Almacena el estado de autenticación
//             onLogin(response.user); // Pasa el usuario autenticado o token
//         } else {
//             setErrors(values => ({ ...values, general: response.message }));
//         }
//     } catch (error) {
//         setErrors(values => ({ ...values, general: 'Login failed, please try again.' }));
//     }
// };




// function App() {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);

//     const handleLogin = (user) => {
//         setIsAuthenticated(true);
//         // Puedes guardar el usuario en localStorage o contexto
//     };

//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<Access onLogin={handleLogin} />} />
//                 <Route path="/contacts" element={<PrivateRoute isAuthenticated={isAuthenticated}><Contacts /></PrivateRoute>} />
//                 <Route path="/add-contact" element={<PrivateRoute isAuthenticated={isAuthenticated}><AddContact /></PrivateRoute>} />
//             </Routes>
//         </Router>
//     );
// }

// export default App;
