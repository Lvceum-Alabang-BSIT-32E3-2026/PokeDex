import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Info, Loader2, UserPlus } from 'lucide-react';

interface RegisterProps {
    onBackToLogin: () => void;
}

const RegisterPage: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        displayName: '' // Optional
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Loading spinner shows during submission

        setTimeout(() => {
            console.log('Registered Trainer:', formData);
            setLoading(false);
            alert('Registration Successful! Please login.');
            onBackToLogin();
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-slate-700 relative">
                        <div className="w-full h-1 bg-slate-900 absolute top-1/2 -translate-y-1/2"></div>
                        <div className="w-6 h-6 bg-white border-4 border-slate-900 rounded-full z-10"></div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Trainer Sign Up</h1>
                    <p className="text-slate-400">Create your trainer credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input required name="email" type="email" placeholder="Email Address" onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                    </div>

                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input required name="username" placeholder="Username" onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input required name="password" type="password" placeholder="Password" onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                        </div>
                        <input required name="confirmPassword" type="password" placeholder="Confirm" onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>

                    <div className="relative">
                        <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input name="displayName" placeholder="Display Name (Optional)" onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="mr-2" size={20} /> Access Pokedex</>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={onBackToLogin} className="text-slate-400 text-sm hover:text-red-500 transition-colors">
                        Already a trainer? Login here
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;