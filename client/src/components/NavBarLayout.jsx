import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function NavBarLayout() {
    return (
        <>
            <NavBar />
            <Outlet />
        </>
    );
}
