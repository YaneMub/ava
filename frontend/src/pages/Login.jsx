import {useState} from 'react'
import { useNavigate, Link } from "react-router-dom"
import logo from '../assets/logo.png'


function Login() {
    const [modo, setModo] = useState('login')
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [tipoUsuario, setTipoUsuario] = useState('sordo')
    const [password, setPassword] = useState('')
    const [confirmarPassword, setConfirmarPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();

        if (modo === 'registro' && password !== confirmarPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        const endpoint = modo === 'login' ? '/api/auth/login' : '/api/auth/register';
        const cuerpo = modo === 'login'
            ? { email, password }
            : { nombre, email, password, tipoUsuario };

        try {
            const respuesta = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cuerpo),
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                setError(datos.error || 'Ocurrió un error, intentá de nuevo');
                return;
            }

            localStorage.setItem('token', datos.token);
            localStorage.setItem('usuario', JSON.stringify(datos.usuario));
            setError('');
            navigate('/');
        } catch (error) {
            console.error('Error al conectar con el backend:', error);
            setError('No se pudo conectar con el servidor');
        }
    }

    return (
        <div className="flex items-center flex-col justify-center h-screen bg-fondo">
            <img src={logo} alt="Logo AVA" className="w-40 h-40 mb-4 object-contain" />
           
           <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-4">
           
              <div className="flex gap-2 w-full">
                <button
                    type="button"
                    onClick={() => setModo('login')}
                    className={`flex-1 text-center rounded-full px-4 py-2 font-bold ${modo === 'login' ? 'bg-lavanda text-white' : 'bg-fondo'}`}>
                    Ingresar
                </button>
                <button
                    type="button"
                    onClick={() => setModo('registro')}
                    className={`flex-1 text-center rounded-full px-4 py-2 font-bold ${modo === 'registro' ? 'bg-lavanda text-white' : 'bg-fondo'}`}>
                    Registrarse
                </button>
              </div>
           
              <form id="loginForm" onSubmit={manejarSubmit} className="flex flex-col gap-4">
                {modo === 'registro' && (
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="border-2 border-borde rounded-lg p-3 text-sm w-full focus:outline-none focus:border-lavanda">
                    </input>
                )}

                <input
                    type="email"
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-borde rounded-lg p-3 text-sm w-full focus:outline-none focus:border-lavanda">
                </input>

                {modo === 'registro' && (
                    <select
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                        className="border-2 border-borde rounded-lg p-3 text-sm w-full focus:outline-none focus:border-lavanda">
                        <option value="sordo">Sordo</option>
                        <option value="hipoacusico">Hipoacúsico</option>
                        <option value="oyente">Oyente</option>
                    </select>
                )}

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-borde rounded-lg p-3 text-sm w-full focus:outline-none focus:border-lavanda">
                </input>

                {modo === 'registro' && (
                    <input
                        type="password"
                        placeholder="Repetir contraseña"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        required
                        className="border-2 border-borde rounded-lg p-3 text-sm w-full focus:outline-none focus:border-lavanda">
                    </input>
                )}

                {error && <p className="text-error text-sm text-center">{error}</p>}

                <button type="submit" className="bg-lavanda text-white font-bold py-3 rounded-lg text-lg w-full hover:opacity-90">
                    {modo === 'login' ? 'Ingresar' : 'Registrarse'}
                </button>
              </form>

              <Link to="/" className="text-textoSecundario text-sm font-semibold text-center hover:text-lavanda">¿Olvidaste tu contraseña?</Link>
           </div>
        </div>
    )
}

export default Login