import { useEffect, useState } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { List, Spin, Image } from "antd"; // Importa Image de 'antd'

export default function Compras() {
    const [user] = useAuthState(auth);
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompras = async () => {
            if (user) {
                try {
                    // Consulta para obtener las compras del usuario autenticado
                    const q = query(collection(firestore, 'compras'), where('__name__', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const comprasData = [];

                    for (const docSnap of querySnapshot.docs) {
                        const compra = { id: docSnap.id, ...docSnap.data() };

                        // Obtener los productos de cada compra
                        const productosRef = collection(firestore, 'compras', docSnap.id, 'productos');
                        const productosSnapshot = await getDocs(productosRef);
                        const productosData = productosSnapshot.docs.map(doc => doc.data());
                        compra.productos = productosData;

                        comprasData.push(compra);
                    }

                    setCompras(comprasData);
                    setLoading(false);
                } catch (error) {
                    console.error("Error al obtener las compras:", error);
                }
            }
        };

        fetchCompras();
    }, [user]);

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className="flex flex-col m-4 p-4">
            <h1>Compras</h1>
            {compras.map(compra => (
                <div key={compra.id}>
                    <h3>Compra ID: {compra.id}</h3>
                    <p>Total: ${compra.total} | Fecha: {compra.fecha.toDate().toLocaleDateString()}</p>
                    <h4>Productos:</h4>
                    <List
                        dataSource={compra.productos}
                        renderItem={producto => (
                            <List.Item style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <Image src={producto.imagen} alt={producto.nombre} width={50} />
                                <span style={{ marginLeft: '10px' }}>
                                    {producto.nombre} - Cantidad: {producto.cantidad} - Precio: ${producto.precio}
                                </span>
                            </List.Item>
                        )}
                    />
                </div>
            ))}
        </div>
    );
}
