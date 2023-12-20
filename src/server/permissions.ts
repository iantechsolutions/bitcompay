/**
 * Los permisos de cada usuario se administran con roles
 * 
 * Cada usuario puede tener varios roles
 * 
 * Cada rol tiene una lista de permisos asignados
 * 
 * Cada permiso se identifica como `resource.subresource.action`
 * Se pueden tener permisos mas amplios como `resource.subresource.*` o `resource.*`
 * 
 * Hay un grupo de roles por defecto que no están en la base de datos y no se pueden modificar
 */

import { db } from "./db"
// import * as schema from "~/server/db/schema"

export type Role = {
    id: string
    name: string
    permissions: string[]
    isSystem: boolean
}

export const systemRoles: Role[] = [
    {
        id: 'admin',
        name: 'Administrador',
        permissions: ['*'],
        isSystem: true,
    },
    {
        id: 'role-editor',
        name: 'Editor de roles',
        permissions: ['admin.roles.*'],
        isSystem: true,
    },
    {
        id: 'documents',
        name: 'Documents user',
        permissions: ['documents.*'],
        isSystem: true,
    }
]

export async function getRoles(): Promise<Role[]> {
    const result = await db.query.roles.findMany({
        with: {
            permissions: true,
        }
    })

    const dbRoles = result.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.map(permission => permission.permission),
        isSystem: false,
    }))

    return [
        ...systemRoles,
        ...dbRoles,
    ]
}