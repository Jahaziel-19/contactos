import './App.css';
import Contacts from './Contacts/Contacts.jsx'
import Leftbar from './Leftbar/Leftbar.jsx';
import { BrowserRouter as  Router, Route, Routes } from 'react-router-dom';
import AddContact from './Leftbar/Elements/AddContact/AddContact.jsx';
import  Login  from './User/login.jsx';

function App() {

  return (
    <>
      <Router>
      <div className='bg-custom-gray border h-screen w-full hide-scrollbar flex '>
        <Leftbar></Leftbar>
        <Routes>
             <Route path='/contacts' element={<Contacts/>}></Route>
            <Route path='/add-contact' element={<AddContact/>}/>
            <Route path='/' element={<Login/>}></Route>
          </Routes>  
      </div>
      </Router>

    </>
  );
}

export default App;
