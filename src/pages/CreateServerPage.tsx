import { serversApi } from '@/api/servers'
import ServerForm from '@/components/ServerForm'
import type { CreateServerInput } from '@/types'

export default function CreateServerPage() {
  const handleSubmit = async (data: CreateServerInput) => {
    await serversApi.create(data)
  }

  return <ServerForm onSubmit={handleSubmit} submitLabel="Create Server" />
}
