import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Detalles from "./components/Detalles";
import Carrito from "./components/Carrito"; // Importa el componente Carrito
import Compras from "./components/Compras"; // Importa el componente Compras

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="detalles/:id" element={<Detalles />} />
          <Route path="carrito" element={<Carrito />} /> {/* Ruta para el carrito */}
          <Route path="compras" element={<Compras />} /> {/* Ruta para las compras */}
        </Route>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </>
  );
}

export default App;