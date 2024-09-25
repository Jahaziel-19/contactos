import './App.css';
import Contacts from './Contacts/Contacts.jsx'
import Leftbar from './Leftbar/Leftbar.jsx';
import { BrowserRouter as  Router, Route, Routes } from 'react-router-dom';
import AddContact from './Leftbar/Elements/AddContact/AddContact.jsx';
import Access from './User/Access.jsx';

function App() {

  return (
    <>
      <Router>
      <div className='bg-custom-gray border h-screen w-full hide-scrollbar flex '>
        <Leftbar></Leftbar>
        <Routes>
             <Route path='/contacts' element={<Contacts/>}></Route>
            <Route path='/add-contact' element={<AddContact/>}/>
            <Route path='/' element={<Access/>}></Route>          
        </Routes>  
      </div>
      </Router>

    </>
  );
}

export default App;
