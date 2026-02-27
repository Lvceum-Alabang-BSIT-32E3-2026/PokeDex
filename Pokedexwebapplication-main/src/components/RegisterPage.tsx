import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Info, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';

interface RegisterProps {
    onBackToLogin: () => void;
}

const RegisterPage: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // Task 1.1.5 requirement
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const validate = (name: string, value: string) => {
        let error = "";
        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = "Email is required";
            else if (!emailRegex.test(value)) error = "Invalid email format";
        }
        if (name === "username") {
            if (!value) error = "Username is required";
            else if (value.length < 3 || value.length > 50) error = "Must be 3-50 characters";
        }
        if (name === "password") {
            if (!value) error = "Password is required";
            else if (value.length < 8) error = "Minimum 8 characters required";
        }
        if (name === "confirmPassword") {
            if (value !== formData.password) error = "Passwords must match";
        }
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const errorMsg = validate(name, value);
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = {
            email: validate("email", formData.email),
            username: validate("username", formData.username),
            password: validate("password", formData.password),
            confirmPassword: validate("confirmPassword", formData.confirmPassword),
        };

        if (Object.values(newErrors).some(err => err !== "")) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        // Task 1.1.5: Simulate API Registration with Success Message and Redirect
        setTimeout(() => {
            setLoading(false);
            setShowSuccess(true);

            setTimeout(() => {
                onBackToLogin();
            }, 2000);
        }, 1500);
    };

    const isFormInvalid =
        Object.values(errors).some(err => err !== "") ||
        !formData.email || !formData.username || !formData.password || !formData.confirmPassword;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700 relative overflow-hidden"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-slate-700 relative">
                        <div className="w-full h-1 bg-slate-900 absolute top-1/2 -translate-y-1/2"></div>
                        <div className="w-6 h-6 bg-white border-4 border-slate-900 rounded-full z-10"></div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Trainer Sign Up</h1>
                    <p className="text-slate-400">Create your trainer credentials</p>
                </div>

                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0 }}
                            className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg flex items-center gap-3 text-sm"
                        >
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <div>
                                <p className="font-bold">Registration Successful!</p>
                                <p className="text-xs opacity-70">Redirecting to login page...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-500' : 'text-slate-500'}`} size={18} />
                        <input
                            required
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.username ? 'text-red-500' : 'text-slate-500'}`} size={18} />
                        <input
                            required
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-slate-900 border ${errors.username ? 'border-red-500' : 'border-slate-700'} rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all`}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-500' : 'text-slate-500'}`} size={18} />
                            <input
                                required
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded-lg py-3 pl-10 text-white text-sm focus:ring-2 focus:ring-red-500 outline-none`}
                            />
                        </div>
                        <div className="relative">
                            <input
                                required
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full bg-slate-900 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-700'} rounded-lg py-3 px-4 text-white text-sm focus:ring-2 focus:ring-red-500 outline-none`}
                            />
                        </div>
                    </div>
                    {(errors.password || errors.confirmPassword) && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors.password || errors.confirmPassword}</p>
                    )}

                    <div className="relative">
                        <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            name="displayName"
                            placeholder="Display Name (Optional)"
                            value={formData.displayName}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || showSuccess || isFormInvalid}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <><UserPlus className="mr-2" size={20} /> Access Pokedex</>
                        )}
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