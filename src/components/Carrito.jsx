import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { List, Button, Spin } from "antd";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export default function Carrito() {
    const [user] = useAuthState(auth);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);

    useEffect(() => {
        const fetchCartItems = async () => {
            if (user) {
                const cartRef = doc(firestore, 'carrito', user.uid);
                const cartSnapshot = await getDoc(cartRef);
                if (cartSnapshot.exists()) {
                    const cartData = cartSnapshot.data();
                    setCartItems(cartData.productos);

                    const total = cartData.productos.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
                    const points = cartData.productos.reduce((sum, item) => sum + item.cantidad * item.puntos, 0);
                    setTotalAmount(total);
                    setTotalPoints(points);
                } else {
                    setCartItems([]);
                    setTotalAmount(0);
                    setTotalPoints(0);
                }
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [user]);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.text("Resumen de la Compra", 14, 16);
        autoTable(doc, {
            startY: 22,
            head: [['Producto', 'Cantidad', 'Precio', 'Puntos', 'Total']],
            body: cartItems.map(item => [item.nombre, item.cantidad, `$${item.precio}`, item.puntos, `$${item.cantidad * item.precio}`]),
        });

        doc.text(`Total: $${totalAmount}`, 14, doc.lastAutoTable.finalY + 10);
        doc.text(`Puntos por compra: ${totalPoints}`, 14, doc.lastAutoTable.finalY + 20);
        doc.save("resumen-de-compra.pdf");
    };

    const handlePurchase = async () => {
        if (user) {
            try {
                const compraRef = doc(firestore, 'compras', user.uid);
                const compraSnapshot = await getDoc(compraRef);

                if (compraSnapshot.exists()) {
                    const compraData = compraSnapshot.data();
                    const nuevosPuntos = (compraData.puntos || 0) + totalPoints;

                    await updateDoc(compraRef, {
                        productos: [...compraData.productos, ...cartItems],
                        total: compraData.total + totalAmount,
                        puntos: nuevosPuntos,
                        ultimaCompra: new Date()
                    });
                } else {
                    await setDoc(compraRef, {
                        productos: cartItems,
                        total: totalAmount,
                        puntos: totalPoints,
                        fecha: new Date()
                    });
                }

                generatePDF();

                const cartRef = doc(firestore, 'carrito', user.uid);
                await deleteDoc(cartRef);

                setCartItems([]);
                setTotalAmount(0);
                setTotalPoints(0);

                alert("Compra realizada con éxito!");
            } catch (error) {
                console.error("Error al realizar la compra:", error);
                alert("Hubo un error al realizar la compra. Inténtalo nuevamente.");
            }
        }
    };

    const handleIncreaseQuantity = async (item) => {
        const updatedCartItems = cartItems.map(cartItem => {
            if (cartItem.id === item.id) {
                return { ...cartItem, cantidad: cartItem.cantidad + 1 };
            }
            return cartItem;
        });
        setCartItems(updatedCartItems);
        await updateCartItems(updatedCartItems);
    };

    const handleDecreaseQuantity = async (item) => {
        const updatedCartItems = cartItems.map(cartItem => {
            if (cartItem.id === item.id && cartItem.cantidad > 1) {
                return { ...cartItem, cantidad: cartItem.cantidad - 1 };
            }
            return cartItem;
        });
        setCartItems(updatedCartItems);
        await updateCartItems(updatedCartItems);
    };

    const handleRemoveFromCart = async (item) => {
        const updatedCartItems = cartItems.filter(cartItem => cartItem.id !== item.id);
        setCartItems(updatedCartItems);
        await updateCartItems(updatedCartItems);
    };

    const updateCartItems = async (updatedItems) => {
        if (user) {
            const cartRef = doc(firestore, 'carrito', user.uid);
            await updateDoc(cartRef, { productos: updatedItems });

            const total = updatedItems.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
            const points = updatedItems.reduce((sum, item) => sum + item.cantidad * item.puntos, 0);
            setTotalAmount(total);
            setTotalPoints(points);
        }
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <>
            <div className="flex flex-col p-4 m-4">
                <h1>Carrito</h1>
                <List
                    itemLayout="horizontal"
                    dataSource={cartItems}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button onClick={() => handleIncreaseQuantity(item)}>+</Button>,
                                <Button onClick={() => handleDecreaseQuantity(item)}>-</Button>,
                                <Button onClick={() => handleRemoveFromCart(item)} danger>Eliminar</Button>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<img src={item.imagen} alt={item.nombre} style={{ width: 50, height: 50 }} />}
                                title={item.nombre}
                                description={`Cantidad: ${item.cantidad} | Precio: $${item.precio} | Puntos: ${item.puntos}`}
                            />
                            <div>
                                Total: ${item.cantidad * item.precio}
                            </div>
                        </List.Item>
                    )}
                />
                <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                    Total: ${totalAmount}
                </div>
                <div style={{ marginTop: '10px', fontSize: '16px' }}>
                    Puntos por compra: {totalPoints}
                </div>
            </div>
            <div className="flex flex-row p-4 m-2">
                <Button type="primary" style={{ marginTop: '20px' }} onClick={handlePurchase}>
                    Comprar
                </Button>
            </div>
        </>
    );
}
