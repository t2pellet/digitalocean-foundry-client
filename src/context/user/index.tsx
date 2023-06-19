import React, { useState, createContext, useMemo } from 'react'

import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

import { useQuery } from '@/api/network'
import { UserType } from '@/context/user/types'
import { ContextType } from '@/types'

type UserContextType = ContextType<UserType | null, undefined>

const UserContext = createContext<UserContextType>({
    isLoading: false,
    data: null,
    dispatch: undefined,
})

const InnerUserProvider: React.FC<React.ReactNode> = ({ children }) => {
    const { isSignedIn, isLoaded, userId } = useAuth()

    const shouldFetchUser = isLoaded && !!isSignedIn
    const { status, data, error } = useQuery<UserType>(
        {
            endpoint: '/users/me',
            enabled: shouldFetchUser,
        },
        [userId, shouldFetchUser],
    )

    const isLoading = !isLoaded || (shouldFetchUser && (status == 'loading' || status == 'idle'))
    const value: UserContextType = useMemo(
        () => ({
            data: isSignedIn ? data || null : null,
            isLoading,
            error: error || undefined,
            dispatch: undefined,
        }),
        [isLoading, isSignedIn, status, userId],
    )

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const UserProvider: React.FC<React.ReactNode> = ({ children, ...rest }) => {
    return (
        <ClerkProvider {...rest} appearance={{ baseTheme: dark }}>
            <InnerUserProvider>{children}</InnerUserProvider>
        </ClerkProvider>
    )
}

export default UserContext
