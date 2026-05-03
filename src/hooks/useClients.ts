import { useState, useCallback, useEffect } from 'react'
import { directoryClient } from '@/lib/client-data/directory-client'
import type { Client } from '@/types/database.types'
import type { CreateClientDto, UpdateClientDto } from '@/types/directory.types'

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Client[]
  isSearching: boolean
  fetchClients: () => Promise<void>
  createClient: (data: CreateClientDto, intakeFiles?: Record<string, File>) => Promise<Client>
  updateClient: (id: string, data: UpdateClientDto) => Promise<Client>
  deleteClient: (id: string) => Promise<void>
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setClients(await directoryClient.listClients())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      setSearchResults(await directoryClient.searchClients(query))
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchClients()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [fetchClients])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => search(searchQuery), 300)
      return () => clearTimeout(timeoutId)
    }

    const timeoutId = setTimeout(() => {
      setSearchResults([])
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, search])

  const createClient = useCallback(
    async (data: CreateClientDto, intakeFiles?: Record<string, File>) => {
      const newClient = await directoryClient.createClient(data, intakeFiles)
      setClients((prev) => [newClient, ...prev])
      return newClient
    },
    []
  )

  const updateClient = useCallback(async (id: string, data: UpdateClientDto) => {
    const updated = await directoryClient.updateClient(id, data)
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    await directoryClient.deleteClient(id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return {
    clients,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  }
}
