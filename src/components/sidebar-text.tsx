'use client'
import { usePathname } from 'next/navigation'
type SidebarTimeProps = {
    children: string
}

const SidebarText: React.FC<SidebarTimeProps> = ({ children }) => {
    const _pathname = usePathname()
    const _sombreado = ' shadow-2xl'
    return <span className='inline-block shadow-3xl'>{children}</span>
}

export default SidebarText
