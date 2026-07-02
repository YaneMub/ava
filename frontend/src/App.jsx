import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Practica from "./pages/Practica.jsx";
import Login from "./pages/Login.jsx";

function App () {
  return(
    <Routes>
      <Route path="/" element={<Practica />}></Route>
      <Route path="/login" element={<Login />}></Route>
    </Routes>
  )
}

export default App

