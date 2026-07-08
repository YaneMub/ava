import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Practica from "./pages/Practica.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MapaCurso from "./pages/MapaCurso.jsx";
import TestNivelacion from "./pages/TestNivelacion.jsx";

function App () {
  return(
    <Routes>
      <Route path="/" element={<Practica />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/dashboard" element={<Dashboard />}></Route>
      <Route path="/curso" element={<MapaCurso />}></Route>
      <Route path="/nivelacion" element={<TestNivelacion />}></Route>
    </Routes>
  )
}

export default App

