import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import SignUpPage from './pages/SignUpPage';
import SignUp from './templates/SignUp';
import LoginPage from './pages/LoginPage';
import Landing from './pages/Landing';
import OtherProfile from './pages/OtherProfile';
import { useAuthContext } from './hooks/useAuthContext';
import { useState } from 'react';
import UserNotFound from './pages/UserNotFound';

function App() {
    const { user } = useAuthContext();

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={user ? <Home /> : <Navigate to="/landing" />}
                    exact
                />
                <Route
                    path="/profile"
                    element={user ? <Profile /> : <Navigate to="/loginpage" />}
                />

                <Route
                    path="/user"
                    element={<OtherProfile/>}
                />

                <Route
                    path="/signup"
                    element={!user ? <SignUpPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/loginpage"
                    element={!user ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route 
                    path="/landing"
                    element={<Landing />}
                />
                <Route 
                    path="/otherprofile"
                    element={<OtherProfile />}
                />
                <Route 
                    path="/usernotfound"
                    element={<UserNotFound />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
//fun
