import './App.css';
import Navbar from './ContactsBox/Navbar.jsx';
import Contacts from './ContactsBox/Contacts.jsx';

function App() {

  
  return (
    <>
      <div className='bg-custom-gray h-screen w-full flex relative'>
        <div className='bg-slate-600 h-full w-2/5'>
          <Navbar/>
          <Contacts/>
        </div>
      </div>
    </>
  );
}

export default App;
