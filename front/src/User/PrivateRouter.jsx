import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Leftbar from '../Leftbar/Leftbar.jsx';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className='bg-custom-gray border h-screen w-full hide-scrollbar flex'>
      <Leftbar />
      {element}
    </div>
  );
};

export default PrivateRoute;
