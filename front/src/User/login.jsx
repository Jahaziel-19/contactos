import { useState, useEffect } from "react";
import * as yup from 'yup';

function Login() {
    const [animation, setAnimation] = useState({ isAnimate: false, label: null });
    const [formValues, setFormValues] = useState({
        name: '',
        number: '',
        email: '',
        general: ''
    });
    const [errors, setErrors] = useState({});
    const [check, setCheck] = useState(false);
    const [animation2, setAnimation2] = useState({ isAnimate: false, side: 'login' });

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
        const { name, email, number } = errors;
        if (name !== '' || email !== '' || number !== '') {
            setErrors(values => ({ ...values, general: 'Fill well all the fields.' }));
            return;
        }
        setErrors(values => ({ ...values, general: '' }));
        setCheck(true);
    };

    const animationLoginSingUp = (side) => {
        setAnimation2({ isAnimate: true, side });
    };

    useEffect(() => {
        if (animation2.isAnimate) {
            const timer = setTimeout(() => {
                setAnimation2(prev => ({ ...prev, isAnimate: false }));
            }, 1000); // La duración de la animación

            return () => clearTimeout(timer);
        }
    }, [animation2.isAnimate]);

    return (
        <div className="bg-custom-gray w-screen hide-scrollbar h-full flex">
            <div className="h-full w-full bg-custom-gray flex flex-col items-center justify-center">
                <div className="h-2/3 w-1/3 bg-custom-gray rounded-3xl shadow-2xl">
                    <div className="bg-gradient-to-r from-indigo-400 to-cyan-600 w-2/5 h-14 top-20 left-44 relative rounded-3xl flex">
                        <div
                            onClick={() => animationLoginSingUp('signup')}
                            className={`w-1/2 h-full bg-white rounded-2xl flex items-center justify-center rounded-br-3xl rounded-tr-3xl ${animation2.isAnimate ? "animation-sing-login" : ""}`}
                        >
                            <p className={`text-2xl ${animation2.side === 'signup' ? 'text-gray-500' : 'text-indigo-400'}`}>
                                {animation2.side === 'signup' ? 'Sign Up' : 'Login'}
                            </p>
                        </div>
                    </div>
                    <form className="gap-16 w-full h-full flex flex-col items-center justify-center" onSubmit={handleSubmit}>
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
                            <label htmlFor="name" className={animation.isAnimate && animation.label === 'name' ? "animation-label text-indigo-400" : 'opacity-0'}>Name</label>
                            <input
                                name="name"
                                placeholder='Name'
                                type="text"
                                className="bg-custom-gray border h-10 rounded-3xl text-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                onFocus={() => { setAnimation({ isAnimate: true, label: 'name' }) }}
                            />
                            {errors.name ? <div className="text-red-500">{errors.name}</div> : null}
                        </div>
                        <button
                            type="submit"
                            className="w-32 h-10 bg-gradient-to-r from-indigo-400 to-cyan-600 rounded-3xl text-white hover:from-indigo-500 hover:to-cyan-700 hover:text-xl"
                        >
                            Login
                        </button>
                        {errors.general ? <div className="text-red-500">{errors.general}</div> : check ? <div className="text-green-500">Contact added successfully.</div> : null}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
