import { auth } from '@clerk/nextjs/server'

export const getServerAuthSession = () => {
    const user = auth()

    return {
        user: {
            id: user.userId!,
        },
    }
}

export const getServerUser = () => {}
