import { ArrowUpRight, ShoppingCart } from 'lucide-react'
import { Metrics } from '../components/Metrics'
export const Dashboard = () => {
    return (
        <section className='space-y-6'>
            {/* Bienvenida */}
            <section className='bg-primary-600 text-white rounded-xl p-6'>
                <h1 className='text-3xl font-semibold mb-2'>
                    Bienvenido de vuelta! 👋
                </h1>
                <p>Aquí está el resumen de tu negocio hoy</p>
            </section>

            {/* Métricas principales */}
            <Metrics />
        </section>
    )
}
