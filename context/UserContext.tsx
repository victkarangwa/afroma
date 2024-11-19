import { createContext, useContext, useEffect, useRef, useState } from 'react'

interface UserContextProps {
  loggedIn: boolean | undefined
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

export const UserContext = createContext<UserContextProps | null>(null)

export const useUserContext = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error(
      '`useUserContext` hook must be called inside `UserProvider`',
    )
  }

  return context
}

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined)

  const initialized = useRef(false)

  const initialize = async () => {
    if (initialized.current) {
      return
    }
    initialized.current = true
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <UserContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
