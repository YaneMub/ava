import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Practica from "./pages/Practica.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MapaCurso from "./pages/MapaCurso.jsx";
import Aprender from "./pages/Aprender.jsx";
import PonAPrueba from "./pages/PonAPrueba.jsx";
import AEscribir from "./pages/AEscribir.jsx";
import Repaso from "./pages/Repaso.jsx";

function App () {
  return(
    <Routes>
      <Route path="/" element={<Practica />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/dashboard" element={<Dashboard />}></Route>
      <Route path="/curso/:slug" element={<MapaCurso />}></Route>
      <Route path="/aprender/:slug/:unitId/:bloque" element={<Aprender />}></Route>
      <Route path="/practicar/:slug/:unitId/:bloque" element={<PonAPrueba />}></Route>
      <Route path="/escribir/:slug/:unitId/:bloque" element={<AEscribir />}></Route>
      <Route path="/repaso/:slug/:unitId" element={<Repaso />}></Route>
    </Routes>
  )
}

export default App

