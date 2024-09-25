import { useState, useEffect } from "react";
import * as yup from 'yup';

function Register() {
    const [animation, setAnimation] = useState({ isAnimate: false, label: null });
    const [formValues, setFormValues] = useState({
        name: '',
        number: '',
        email: '',
        password: '',
        rpassword: '',  
        general: ''
    });
    const [errors, setErrors] = useState({});
    const [check, setCheck] = useState(false);

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
        rpassword: yup.string()
            .oneOf([yup.ref('password'), null], 'Passwords must match.')
            .required('Please confirm your password.')
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


    return (
                <div className="h-5/6 w-1/3 bg-custom-gray rounded-3xl shadow-2xl border-indigo-400 border-2">
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
                </div>
    );
}

export default Register;
