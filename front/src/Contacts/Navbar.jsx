function Navbar(){
    return(
        <div className='bg-gradient-to-r from-indigo-400 to-cyan-600 w-full h-16 flex items-center justify-center'>
            <input
              className="rounded-full bg-violet-100 text-xl border-2 w-4/5 h-1/2 p-4 placeholder-cyan-600 focus:text-violet-950 focus:border-cyan-600 focus:outline-none  focus:ring-cyan-300"
              placeholder="Busca entre tus contactos..."
            />
        </div>
    )
}

export default Navbar;