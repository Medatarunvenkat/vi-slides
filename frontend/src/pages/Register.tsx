import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import './Auth.css';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Student' as 'Teacher' | 'Student'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);

        if (password.length < minLength) return "Password must be at least 8 characters long";
        if (!hasUpperCase) return "Password must contain at least one uppercase letter (A-Z)";
        if (!hasLowerCase) return "Password must contain at least one lowercase letter (a-z)";
        if (!hasNumber) return "Password must contain at least one number (0-9)";
        if (!hasSpecialChar) return "Password must contain at least one special character (!@#$%^&*)";

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            // Pass the selected role to the backend
            const res = await authService.googleLogin(credentialResponse.credential, formData.role);
            if (res.success) {
                sessionStorage.setItem('token', res.token);
                sessionStorage.setItem('user', JSON.stringify(res.user));
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google Signup failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="auth-content fade-in">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join Vi-SlideS and transform your classroom</p>
                    </div>

                    {error && (
                        <div className="alert alert-error slide-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role" className="form-label">I am a</label>
                            <select
                                id="role"
                                name="role"
                                className="form-select"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    style={{ paddingRight: '2.5rem' }}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10
                                    }}
                                >
                                    {showPassword ? '👁️' : '🙈'}
                                </button>
                            </div>

                            {/* Password Requirements Checklist */}
                            <div className="password-requirements" style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {[
                                        { label: '8+ Characters', met: formData.password.length >= 8 },
                                        { label: 'Uppercase (A-Z)', met: /[A-Z]/.test(formData.password) },
                                        { label: 'Lowercase (a-z)', met: /[a-z]/.test(formData.password) },
                                        { label: 'Number (0-9)', met: /[0-9]/.test(formData.password) },
                                        { label: 'Special (!@#$%^&*)', met: /[!@#$%^&*]/.test(formData.password) }
                                    ].map((req, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            color: req.met ? '#22c55e' : 'var(--color-text-muted)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                width: '18px',
                                                height: '18px',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${req.met ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                                                borderRadius: '50%',
                                                fontSize: '0.7rem',
                                                background: req.met ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                                            }}>
                                                {req.met ? '✓' : ''}
                                            </span>
                                            {req.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="••••••••"
                                    style={{ paddingRight: '2.5rem' }}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10
                                    }}
                                >
                                    {showConfirmPassword ? '👁️' : '🙈'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span style={{ marginLeft: '0.5rem' }}>Creating account...</span>
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0 10px', color: '#ccc', position: 'relative', zIndex: 1, borderRadius: '4px' }}>OR</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.1)', zIndex: 0 }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Signup Failed')}
                            theme="filled_black"
                            shape="pill"
                            width="250"
                            text="signup_with"
                        />
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                        (Will use selected role: <strong>{formData.role}</strong>)
                    </p>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
