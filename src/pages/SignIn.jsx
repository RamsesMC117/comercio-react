import { Link, useNavigate } from "react-router-dom"; // Importa useNavigate
import { useForm } from "react-hook-form";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // Importa signInWithEmailAndPassword
import { auth } from "../firebaseConfig"; // Importa 'auth' desde 'firebaseConfig.js'

export default function SignIn() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMessage, setErrorMessage] = useState(""); 
    const navigate = useNavigate(); // Obtén la función de navegación

    const onSubmit = async (data) => {
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password); // Inicia sesión con email y contraseña
            navigate("/"); // Redirige al usuario a la ruta "/"
        } catch (error) {
            setErrorMessage("Credenciales inválidas. Por favor, verifica tu correo electrónico y contraseña."); // Muestra un mensaje de error
            console.error("Error al iniciar sesión:", error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
                <h1 className="text-center text-2xl font-bold mb-4">Iniciar sesión</h1>
                <p className="text-center">La mejor tienda en linea</p>
                <br />
                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <input
                            type="email"
                            {...register("email", { required: true })}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Correo electrónico"
                        />
                        {errors.email && <span className="text-red-500">Este campo es requerido</span>}
                    </div>
                    <div className="mb-6">
                        <input
                            type="password"
                            {...register("password", { required: true })}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Contraseña"
                        />
                        {errors.password && <span className="text-red-500">Este campo es requerido</span>}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Iniciar sesión</button>
                    <div className="mt-4 text-center">
                        <span>¿No tienes una cuenta? </span>
                        <Link to="/Sign-Up" className="text-blue-500 hover:underline">Regístrate</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
