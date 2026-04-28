import { useState, useCallback, useEffect } from 'react'
import { clientService, CreateClientDto, UpdateClientDto } from '@/lib/services/client.service'
import type { Client } from '@/types/database.types'

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Client[]
  isSearching: boolean
  fetchClients: () => Promise<void>
  createClient: (data: CreateClientDto) => Promise<Client>
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
      const data = await clientService.findAll()
      setClients(data)
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
      const results = await clientService.search(query)
      setSearchResults(results)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => search(searchQuery), 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, search])

  const createClient = useCallback(
    async (data: CreateClientDto) => {
      const newClient = await clientService.create(data, 'current-user-id')
      setClients((prev) => [newClient, ...prev])
      return newClient
    },
    []
  )

  const updateClient = useCallback(async (id: string, data: UpdateClientDto) => {
    const updated = await clientService.update(id, data)
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    await clientService.delete(id)
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