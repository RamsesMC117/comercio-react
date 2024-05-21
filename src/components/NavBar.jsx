import { Link } from "react-router-dom";
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, Badge } from 'antd';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

export default function NavBar() {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();
    const [cartItemCount, setCartItemCount] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0); // Nuevo estado para los puntos totales

    useEffect(() => {
        if (user) {
            const cartRef = doc(firestore, 'carrito', user.uid);

            const unsubscribeCart = onSnapshot(cartRef, (cartSnapshot) => {
                if (cartSnapshot.exists()) {
                    const cartData = cartSnapshot.data();
                    const itemCount = cartData.productos.length;
                    setCartItemCount(itemCount);
                } else {
                    setCartItemCount(0);
                }
            }, (error) => {
                console.error("Error al obtener el contador del carrito:", error);
            });

            return () => unsubscribeCart();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const comprasRef = doc(firestore, 'compras', user.uid);

            const unsubscribeCompras = onSnapshot(comprasRef, (comprasSnapshot) => {
                if (comprasSnapshot.exists()) {
                    const comprasData = comprasSnapshot.data();
                    setTotalPoints(comprasData.puntos || 0);
                } else {
                    setTotalPoints(0);
                }
            }, (error) => {
                console.error("Error al obtener los puntos de las compras:", error);
            });

            return () => unsubscribeCompras();
        }
    }, [user]);

    const handleLogout = () => {
        auth.signOut();
        navigate("/");
    };

    const menu = (
        <Menu>
            {user && (
                <>
                    <Menu.Item key="1" icon={<UserOutlined />}>
                        {user.email}
                    </Menu.Item>
                    <Menu.Item key="2" icon={<UserOutlined />}>
                        <Link to="/compras">Mis Compras</Link>
                    </Menu.Item>
                    <Menu.Divider />
                </>
            )}
            <Menu.Item key="3" onClick={handleLogout} icon={<LogoutOutlined />}>
                Cerrar sesión
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="flex justify-between p-2 m-2 rounded-2xl bg-sky-950 h-20 items-center">
            <Link to="/" className="text-white text-2xl font-bold">Tienda.com</Link>
            <div className="flex flex-row items-center">
                {user ? (
                    <>
                        <div className="text-white mx-2">
                            Puntos: {totalPoints}
                        </div>
                        <Dropdown overlay={menu} placement="bottomRight" arrow>
                            <Avatar shape="square" size="large" icon={<UserOutlined />} />
                        </Dropdown>
                        <Link to="/carrito" className="text-white mx-2">
                            <Badge count={cartItemCount}>
                                <Avatar shape="square" size="large" icon={<ShoppingCartOutlined />} />
                            </Badge>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/Sign-Up" className="text-white mx-2">Crear cuenta</Link>
                        <Link to="/Sign-In" className="text-white mx-2">Ingresa</Link>
                    </>
                )}
            </div>
        </div>
    );
}
