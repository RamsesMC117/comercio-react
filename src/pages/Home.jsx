import { useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import Productos from "../components/Productos";
import Detalles from "../components/Detalles";
import Carrito from "../components/Carrito"; // Importa el componente Carrito
import Compras from "../components/Compras"; // Importa el componente Compras

export default function Home() {
    const location = useLocation();
    const isDetailPage = location.pathname.includes('/detalles');
    const isCartPage = location.pathname === '/carrito';
    const isComprasPage = location.pathname === '/compras';
    
    return (
        <>
            <div className="flex flex-col">
                <div>
                    <NavBar />
                </div>
                <div>
                    {/* Muestra los detalles solo si estás en la página de detalles */}
                    {isDetailPage && <Detalles />}
                    {/* Muestra los productos solo si no estás en la página de detalles, carrito ni compras */}
                    {!isDetailPage && !isCartPage && !isComprasPage && <Productos />}
                    {/* Muestra el carrito solo si estás en la página del carrito */}
                    {isCartPage && <Carrito />}
                    {/* Muestra las compras solo si estás en la página de compras */}
                    {isComprasPage && <Compras />}
                </div>
            </div>
        </>
    );
}
