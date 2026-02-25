import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Info, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

        setTimeout(() => {
            setLoading(false);
            setShowSuccess(true);

            setTimeout(() => {
                navigate('/login'); // ✅ Proper router navigation
            }, 2000);

        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            {/* form UI unchanged */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => navigate('/login')}
                    className="text-slate-400 text-sm hover:text-red-500 transition-colors"
                >
                    Already a trainer? Login here
                </button>
            </div>
        </div>
    );
};

export default RegisterPage;