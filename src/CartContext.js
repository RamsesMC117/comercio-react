import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types'; // Importa PropTypes

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart([...cart, product]);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Agrega la validación de PropTypes para children
CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
