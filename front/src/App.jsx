import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './User/AuthContext.jsx';
import AddContact from './Leftbar/Elements/AddContact/AddContact.jsx';
import Contacts from './Contacts/Contacts.jsx';
import Access from './User/Access.jsx';
// import PrivateRoute from './User/PrivateRouter.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='bg-custom-gray border h-screen w-full hide-scrollbar flex '>
          <Routes>
            <Route path='/' element={<Access />} />
            <Route path='/contacts' element={<Contacts />} />
            <Route path='/add-contact' element={<AddContact />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
