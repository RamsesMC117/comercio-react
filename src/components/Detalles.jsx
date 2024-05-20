import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app, auth } from '../firebaseConfig';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Select, Button } from 'antd';

const { Option } = Select;

export default function Detalles() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [producto, setProducto] = useState(null);
    const [userExists, setUserExists] = useState(false);
    const [redirectPath, setRedirectPath] = useState(null);
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1); // Estado para la cantidad seleccionada

    useEffect(() => {
        const obtenerProducto = async () => {
            const db = getFirestore(app);
            const productoDoc = doc(db, 'productos', id);
            const productoSnapshot = await getDoc(productoDoc);
            if (productoSnapshot.exists()) {
                setProducto(productoSnapshot.data());
            }
        };

        obtenerProducto();
    }, [id]);

    useEffect(() => {
        const checkUserExists = async () => {
            const user = auth.currentUser;
            setUserExists(!!user);
            if (!user && location.pathname !== "/Sign-In") {
                setRedirectPath(location.pathname);
            }
            if (user && redirectPath) {
                navigate(redirectPath);
                setRedirectPath(null);
            }
        };

        checkUserExists();
    }, [redirectPath, navigate, location.pathname]);

    const handleChange = (value) => {
        setCantidadSeleccionada(value); // Actualizar el estado con la cantidad seleccionada
    };

    const handleAddToCart = async () => {
        if (!userExists) {
            navigate('/Sign-In');
            return;
        }

        // Crear un objeto con la información del producto a agregar al carrito
        const productoParaAgregar = {
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidadSeleccionada,
            imagen: producto.imagen
        };

        try {
            const user = auth.currentUser;
            const db = getFirestore(app);
            const carritoRef = doc(db, 'carrito', user.uid); // Referencia al documento del carrito del usuario

            // Obtener el documento actual del carrito del usuario
            const carritoSnapshot = await getDoc(carritoRef);

            if (carritoSnapshot.exists()) {
                // Si el carrito ya existe, actualizarlo con el nuevo producto
                await setDoc(carritoRef, {
                    productos: [...carritoSnapshot.data().productos, productoParaAgregar]
                }, { merge: true }); // Usar merge para fusionar con los datos existentes
            } else {
                // Si el carrito no existe, crearlo con el nuevo producto
                await setDoc(carritoRef, {
                    productos: [productoParaAgregar]
                });
            }

            console.log('Producto agregado al carrito');
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
        }
    };

    const handleBuyNow = () => {
        if (!userExists) {
            navigate('/Sign-In');
            return;
        }
        console.log('Compra iniciada');
        // Lógica para iniciar la compra del producto
    };

    if (!producto) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <div className='p-4 m-2 flex flex-row gap-20'>
                <div className='flex flex-col rounded-lg drop-shadow-2xl w-96 h-96'>
                    <img src={producto.imagen} alt={producto.nombre} />
                </div>
                <div className='flex flex-row rounded-lg drop-shadow-2xl w-96 h-96'>
                    <div className='flex flex-col'>
                        <h2 className='text-2xl font-bold'>{producto.nombre}</h2>
                        <p className='text-lg'>{producto.descripcion}</p>
                        <p className='text-lg'>Precio: ${producto.precio}</p>
                    </div>
                </div>
                <div className='flex flex-row rounded-lg drop-shadow-2xl w-96 h-96'>
                    <div className='flex flex-col gap-8'>
                        <p className='text-2xl font-bold'>${producto.precio}</p>
                        <p>Entrega gratis el sábado 25 de mayo
                            realiza el pedido dentro de las próximas 5 hrs</p>
                        <div className='flex items-center'>
                            <EnvironmentOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
                            <span>Se entregará en Chilpancingo, 3900</span>
                        </div>
                        <p className='text-sky-950 font-semibold'>Disponible</p>
                        <Select defaultValue="1" style={{ width: 120 }} onChange={handleChange}>
                            {Array.from({ length: producto.cantidad }, (_, i) => (
                                <Option key={i + 1} value={i + 1}>{i + 1}</Option>
                            ))}
                        </Select>
                        <div className='flex gap-4'>
                            <Button type="primary" onClick={handleAddToCart}>Agregar al carrito</Button>
                            <Button type="danger" onClick={handleBuyNow}>Comprar</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
