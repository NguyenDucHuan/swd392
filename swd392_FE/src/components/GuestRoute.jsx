import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const GuestRoute = ({children}) => {
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token, navigate]); // Add dependencies to avoid React hooks warning

    if (token) return <Navigate to="/" />;

    return children;
};

export default GuestRoute;