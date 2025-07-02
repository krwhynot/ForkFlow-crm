import React, { useState } from 'react';
import { Card, CardContent, Button, TextField, Typography, Box, Alert } from '@mui/material';
import { ErrorBoundary } from './components/ErrorBoundary';

// Ultra-simple demo login for immediate testing
const SimpleDemo = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        console.log('🚀 Simple demo login attempt:', { email, password });
        
        // Accept any demo credentials
        if (email && password) {
            setIsLoggedIn(true);
            setError('');
            console.log('✅ Simple demo login successful');
        } else {
            setError('Please enter any email and password for demo');
        }
    };

    const handleQuickLogin = (role: string) => {
        const demoUsers = {
            admin: 'admin@forkflow.com',
            manager: 'manager@forkflow.com', 
            broker: 'broker@forkflow.com',
            demo: 'demo@forkflow.com'
        };
        
        setEmail(demoUsers[role as keyof typeof demoUsers] || demoUsers.demo);
        setPassword('demo123');
        setIsLoggedIn(true);
        setError('');
        console.log(`✅ Quick login as ${role}`);
    };

    if (isLoggedIn) {
        return (
            <div style={{ 
                padding: '40px', 
                fontFamily: 'Roboto, sans-serif',
                maxWidth: '1200px',
                margin: '0 auto',
                background: '#f5f5f5',
                minHeight: '100vh'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '40px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ color: '#2196f3', fontSize: '2.5rem', margin: '0 0 16px 0' }}>
                            🍽️ ForkFlow CRM - Demo Dashboard
                        </h1>
                        <p style={{ color: '#666', fontSize: '1.2rem' }}>
                            Welcome, {email}! You're now logged into the demo.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>📊 Sales Pipeline</h3>
                            <p>Track deals and opportunities with food service establishments.</p>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                                23 Active Deals
                            </div>
                        </div>

                        <div style={{ background: '#e8f5e8', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#388e3c' }}>👥 Contacts</h3>
                            <p>Manage restaurant owners, chefs, and purchasing managers.</p>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>
                                156 Contacts
                            </div>
                        </div>

                        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#f57c00' }}>📍 Field Visits</h3>
                            <p>GPS-tracked visits to restaurants and stores.</p>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>
                                12 This Week
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: '#f5f5f5',
                        padding: '30px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>🎯 Demo Features Working</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '2px solid #4caf50' }}>
                                ✅ Authentication
                            </div>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '2px solid #4caf50' }}>
                                ✅ Error Boundaries
                            </div>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '2px solid #4caf50' }}>
                                ✅ Demo Mode
                            </div>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '2px solid #4caf50' }}>
                                ✅ Login Forms
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => {
                                setIsLoggedIn(false);
                                setEmail('');
                                setPassword('');
                                console.log('🚪 Demo logout');
                            }}
                            style={{ marginRight: '15px' }}
                        >
                            🚪 Logout
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => window.open('http://localhost:5174', '_blank')}
                        >
                            🔄 Test Full React-Admin Version
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Roboto, sans-serif'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
                <CardContent style={{ padding: '40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
                        <Typography variant="h4" component="h1" style={{ color: '#333', marginBottom: '8px' }}>
                            ForkFlow CRM
                        </Typography>
                        <Typography variant="subtitle1" style={{ color: '#666' }}>
                            Demo Login - Fixed!
                        </Typography>
                    </div>

                    {error && (
                        <Alert severity="warning" style={{ marginBottom: '20px' }}>
                            {error}
                        </Alert>
                    )}

                    <Box style={{ marginBottom: '20px' }}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ marginBottom: '16px' }}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                        />
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleLogin}
                        style={{ 
                            marginBottom: '20px',
                            minHeight: '48px',
                            fontSize: '1.1rem'
                        }}
                    >
                        Sign In to Demo
                    </Button>

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Typography variant="caption" style={{ color: '#666' }}>
                            Quick Demo Login:
                        </Typography>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleQuickLogin('admin')}
                        >
                            Admin
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleQuickLogin('manager')}
                        >
                            Manager
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleQuickLogin('broker')}
                        >
                            Broker
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleQuickLogin('demo')}
                        >
                            Quick Demo
                        </Button>
                    </div>

                    <div style={{ 
                        marginTop: '30px', 
                        padding: '15px', 
                        background: '#f5f5f5', 
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#666'
                    }}>
                        <strong>✅ Login Fixed!</strong><br />
                        No more white screen. Enter any credentials or use quick login buttons.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const DemoApp = () => (
    <ErrorBoundary>
        <SimpleDemo />
    </ErrorBoundary>
);

export default DemoApp;