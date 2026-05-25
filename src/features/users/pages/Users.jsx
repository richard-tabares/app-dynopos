import { useEffect, useState, useCallback, startTransition } from 'react'
import { Users as UsersIcon, UserPlus, Loader, Shield, UserCog } from 'lucide-react'
import { getUsers } from '../helpers/getUsers'
import { UserFormModal } from '../components/UserFormModal'
import { useStore } from '../../../app/providers/store'

const roleConfig = {
    admin: { label: 'Admin', className: 'bg-purple-600/10 text-purple-500 border-purple-100/20' },
    supervisor: { label: 'Supervisor', className: 'bg-blue-600/10 text-blue-500 border-blue-100/20' },
    cajero: { label: 'Cajero', className: 'bg-green-600/10 text-green-500 border-green-100/20' },
}

export const Users = () => {
    const user = useStore((state) => state.user)
    const businessId = user?.profile?.business_id || user?.data?.user?.id

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editUser, setEditUser] = useState(null)

    const loadUsers = useCallback((id) => {
        if (!id) return
        startTransition(() => setLoading(true))
        getUsers(id).then((data) => {
            if (Array.isArray(data)) {
                startTransition(() => setUsers(data))
            }
            startTransition(() => setLoading(false))
        })
    }, [])

    useEffect(() => {
        loadUsers(businessId)
    }, [businessId, loadUsers])

    const handleEdit = (u) => {
        setEditUser(u)
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
        setEditUser(null)
    }

    return (
        <>
            <section className='space-y-6'>
                <section className='flex items-center justify-between'>
                    <section>
                        <h2 className='text-2xl font-bold text-on-surface flex items-center gap-2'>
                            <UsersIcon className='w-6 h-6 text-accent' />
                            Usuarios
                        </h2>
                        <p className='text-sm text-muted mt-1'>
                            Gestiona los usuarios de tu negocio
                        </p>
                    </section>
                    <button
                        onClick={() => setModalOpen(true)}
                        className='px-4 py-2 bg-accent text-surface text-sm font-medium rounded-lg hover:bg-accent/85 transition cursor-pointer flex items-center gap-2'>
                        <UserPlus className='w-4 h-4' />
                        Nuevo Usuario
                    </button>
                </section>

                <section className='bg-surface border border-outline rounded-xl'>
                    {loading ? (
                        <section className='flex items-center justify-center py-16'>
                            <Loader className='w-6 h-6 animate-spin text-accent' />
                        </section>
                    ) : users.length === 0 ? (
                        <section className='flex flex-col items-center justify-center py-16 text-center'>
                            <UsersIcon className='w-12 h-12 text-muted mb-3' />
                            <p className='text-muted font-medium'>No hay usuarios aún</p>
                            <p className='text-sm text-muted mt-1'>Crea tu primer usuario para empezar</p>
                        </section>
                    ) : (
                        <section className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b border-outline'>
                                        <th className='text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4'>Usuario</th>
                                        <th className='text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4'>Correo</th>
                                        <th className='text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-4'>Rol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const role = roleConfig[u.role] || roleConfig.cajero
                                        const initials = (u.display_name || u.email || '??')
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)
                                        return (
                                            <tr
                                                key={u.id}
                                                onClick={() => handleEdit(u)}
                                                className='border-b border-outline last:border-b-0 hover:bg-accent/5 transition cursor-pointer'>
                                                <td className='px-6 py-4'>
                                                    <section className='flex items-center gap-3'>
                                                        <section className='w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0'>
                                                            <span className='text-sm font-semibold text-accent'>{initials}</span>
                                                        </section>
                                                        <span className='text-sm font-medium text-on-surface'>
                                                            {u.display_name || 'Sin nombre'}
                                                        </span>
                                                    </section>
                                                </td>
                                                <td className='px-6 py-4 text-sm text-muted'>
                                                    {u.email || '—'}
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${role.className}`}>
                                                        {u.role === 'cajero' ? <UserCog className='w-3 h-3' /> : <Shield className='w-3 h-3' />}
                                                        {role.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </section>
                    )}
                </section>
            </section>

            {modalOpen && (
                <UserFormModal
                    mode={editUser ? 'edit' : 'create'}
                    userData={editUser}
                    onClose={handleCloseModal}
                    onSuccess={() => loadUsers(businessId)}
                />
            )}
        </>
    )
}
