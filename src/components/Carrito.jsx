import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; // Importa updateDoc
import { List, Button, Spin, InputNumber } from "antd"; // Ant Design components for better UI
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export default function Carrito() {
    const [user] = useAuthState(auth);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchCartItems = async () => {
            if (user) {
                const cartRef = doc(firestore, 'carrito', user.uid); // Reference to the user's cart
                const cartSnapshot = await getDoc(cartRef); // Get the cart document
                if (cartSnapshot.exists()) {
                    const cartData = cartSnapshot.data();
                    setCartItems(cartData.productos); // Set the cart items in state

                    // Calculate the total amount
                    const total = cartData.productos.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
                    setTotalAmount(total);
                } else {
                    setCartItems([]); // If the cart doesn't exist, set an empty array
                    setTotalAmount(0); // Set total amount to 0
                }
                setLoading(false); // Set loading to false once data is fetched
            }
        };

        fetchCartItems();
    }, [user]);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.text("Resumen de la Compra", 14, 16);
        autoTable(doc, {
            startY: 22,
            head: [['Producto', 'Cantidad', 'Precio', 'Total']],
            body: cartItems.map(item => [item.nombre, item.cantidad, `$${item.precio}`, `$${item.cantidad * item.precio}`]),
        });

        doc.text(`Total: $${totalAmount}`, 14, doc.lastAutoTable.finalY + 10);
        doc.save("resumen-de-compra.pdf");
    };

    const handlePurchase = async () => {
        if (user) {
            try {
                // Move cart items to the "compras" collection
                const compraRef = doc(firestore, 'compras', user.uid);
                await setDoc(compraRef, {
                    productos: cartItems,
                    total: totalAmount,
                    fecha: new Date()
                });

                // Generate the PDF
                generatePDF();

                // Clear the cart
                const cartRef = doc(firestore, 'carrito', user.uid);
                await deleteDoc(cartRef); // Delete the cart document

                // Clear local state
                setCartItems([]);
                setTotalAmount(0);

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
        }
    };

    if (loading) {
        return <Spin size="large" />; // Show a loading spinner while data is being fetched
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
                                <Button onClick={() => handleRemoveFromCart(item)} danger>Eliminar</Button> // Add a remove button
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<img src={item.imagen} alt={item.nombre} style={{ width: 50, height: 50 }} />} // Use the product image
                                title={item.nombre}
                                description={`Cantidad: ${item.cantidad} | Precio: $${item.precio}`}
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
            </div>
            <div className="flex flex-row p-4 m-2">
                <Button type="primary" style={{ marginTop: '20px' }} onClick={handlePurchase}>
                    Comprar
                </Button>
            </div>
        </>
    );
}
