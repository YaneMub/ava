import {useState} from 'react'
import { useNavigate, Link } from "react-router-dom"
import logo from '../assets/logo.png'


function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();

    const manejarSubmit = (e) => {
        e.preventDefault();
        navigate('/');
    }

    return (
        <div className="flex items-center flex-col justify-center h-screen bg-fondo">
            <img src={logo} alt="Logo AVA" className="w-24 h-24 mb-4 object-contain" />
           <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                <span className="flex-1 text-center rounded-full px-4 py-2 font-bold bg-lavanda text-white">Ingresar</span>
                <Link to="/register" className="flex-1 text-center rounded-full px-4 py-2 font-bold bg-fondo">Registrarse</Link>
              </div>
              <h1 className="text-2xl font-bold text-textoPrincipal text-center">Inciar Sesión</h1>
              <form id="loginForm" onSubmit={manejarSubmit} className="flex flex-col gap-4">
                <input 
                    type="email" 
                    placeholder='Email'
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-borde rounded-lg p-3 text-sm w-full focus:outline-none focus:border-lavanda">
                </input>

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-borde rounded-lg p-3 text-sm w-full focus:outline-none focus:border-lavanda">
                </input>
                <button type="submit" className="bg-lavanda text-white font-bold py-3 rounded-lg text-lg w-full hover:opacity-90">Ingresar</button>
              </form>
            
              <Link to="/register" className="text-textoSecundario text-sm text-center hover:text-lavanda">¿No tenes cuenta? Registrate</Link>
           </div>
        </div>
    )
}

export default Login