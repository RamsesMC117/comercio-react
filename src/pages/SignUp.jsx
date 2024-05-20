import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';


export default function SignUp() {
    const navigate = useNavigate(); // Obtener la función de navegación

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            await createUserWithEmailAndPassword(auth, data.email, data.password);
            console.log('Usuario registrado con éxito');
            // Redirigir al usuario a la página principal
            navigate('/');
        } catch (error) {
            console.error('Error al registrar el usuario:', error.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
                <h1 className="text-center text-2xl font-bold mb-4">Registrarse</h1>
                <p className="text-center">La mejor tienda en línea</p>
                <br />
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <input
                            type="email"
                            {...register('email', { required: true })}
                            className="mt-1 block w-full p-2 border border-sky-900 rounded-lg"
                            placeholder="Correo electrónico"
                        />
                        {errors.email && <span className="text-red-500">Este campo es requerido</span>}
                    </div>
                    <div className="mb-6">
                        <input
                            type="password"
                            {...register('password', { required: true })}
                            className="mt-1 block w-full p-2 border border-sky-900 rounded-lg"
                            placeholder="Contraseña"
                        />
                        {errors.password && <span className="text-red-500">Este campo es requerido</span>}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Registrarse</button>
                    <div className="mt-4 text-center">
                        <span>¿Ya tienes una cuenta? </span>
                        <Link to="/Sign-In" className="text-blue-500 hover:underline">Inicia sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
