import { Card, Col, Row, Button } from 'antd';
import { useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../firebaseConfig'; // Asegúrate de importar tu variable 'app' de firebaseConfig.js
import { Link } from 'react-router-dom';

export default function Productos() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        const db = getFirestore(app);
        const productosCollection = collection(db, 'productos');

        const unsubscribe = onSnapshot(productosCollection, (snapshot) => {
            const productosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProductos(productosData);
        });

        return () => unsubscribe();
    }, []);

    const acortarDescripcion = (descripcion, longitudMaxima) => {
        if (descripcion.length > longitudMaxima) {
            return descripcion.substring(0, longitudMaxima) + '...';
        }
        return descripcion;
    };

    const formatearPrecio = (precio) => {
        return precio.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
    };

    return (
        <>
            <div className='m-2 p-2'>
                <Row gutter={16}>
                    {productos.map((producto, index) => (
                        <Col span={8} key={index} style={{ marginBottom: '16px' }}>
                            <Card
                                title={producto.nombre}
                                bordered={false}
                                className='m-2 p-2 drop-shadow-2xl'
                                style={{ height: '100%', position: 'relative' }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={producto.imagen}
                                        alt={producto.nombre}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s',
                                        }}
                                        onMouseOver={(e) => { e.target.style.transform = 'scale(0.9)'; }}
                                        onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
                                    />
                                </div>
                                <h3 style={{ marginBottom: '8px' }}>{formatearPrecio(producto.precio)}</h3>
                                <p style={{ marginBottom: '8px', fontSize: '16px' }}>{acortarDescripcion(producto.descripcion, 100)}</p>
                                <p>Cantidad: {producto.cantidad}</p>
                                <Link to={`detalles/${producto.id}`}>
                                    <Button type='primary' style={{ position: 'absolute', bottom: '16px', right: '16px' }}>Ver detalles</Button>
                                </Link>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}
