import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from './hooks/useGlobalReducer';
import { BackendURL } from './components/BackendURL';
import { MapProvider } from './utils/MapProvider';
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/custom.scss";
import "./styles/index.css"

const Main = () => {

    if (! import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL == "") return (
        <BackendURL />
    );
    return (
        <StoreProvider>
            <MapProvider>
                <RouterProvider router={router}>
                </RouterProvider>
            </MapProvider>
            <Toaster />
        </StoreProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
