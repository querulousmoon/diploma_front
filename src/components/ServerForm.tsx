import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CreateServerInput } from '@/types'
import './ServerForm.css'

interface ServerFormProps {
  initialData?: Partial<CreateServerInput>
  onSubmit: (data: CreateServerInput) => Promise<void>
  submitLabel?: string
}

export default function ServerForm({ 
  initialData, 
  onSubmit, 
  submitLabel = 'Create Server' 
}: ServerFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CreateServerInput>({
    name: initialData?.name || '',
    host: initialData?.host || '',
    port: initialData?.port || 22,
    connection_type: initialData?.connection_type || 'ssh',
    environment: initialData?.environment || 'development',
    tags: initialData?.tags || [],
    ssh_username: initialData?.ssh_username || '',
    ssh_password: initialData?.ssh_password || '',
    ssh_private_key: initialData?.ssh_private_key || '',
  })

  const [tagInput, setTagInput] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 22 : value,
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const submitData: CreateServerInput = {
        name: formData.name,
        host: formData.host,
        port: formData.port,
        connection_type: formData.connection_type,
        environment: formData.environment,
        tags: formData.tags,
      }

      if (formData.ssh_username) submitData.ssh_username = formData.ssh_username
      if (formData.ssh_password) submitData.ssh_password = formData.ssh_password
      if (formData.ssh_private_key) submitData.ssh_private_key = formData.ssh_private_key

      await onSubmit(submitData)
      navigate('/servers')
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="server-form">
      <div className="server-form__header">
        <button 
          onClick={() => navigate('/servers')}
          className="server-form__back-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="server-form__title">
          {initialData ? 'Edit Server' : 'Add New Server'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="server-form__form">
        {error && (
          <div className="server-form__error">
            {error}
          </div>
        )}

        <div className="server-form__section">
          <h2 className="server-form__section-title">Basic Information</h2>
          
          <div className="server-form__field">
            <label htmlFor="name" className="server-form__label">
              Server Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Production API Server"
              className="server-form__input"
            />
          </div>

          <div className="server-form__row">
            <div className="server-form__field">
              <label htmlFor="host" className="server-form__label">
                Host *
              </label>
              <input
                id="host"
                name="host"
                type="text"
                value={formData.host}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="192.168.1.100"
                className="server-form__input"
              />
            </div>

            <div className="server-form__field">
              <label htmlFor="port" className="server-form__label">
                Port *
              </label>
              <input
                id="port"
                name="port"
                type="number"
                value={formData.port}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                min="1"
                max="65535"
                className="server-form__input"
              />
            </div>
          </div>

          <div className="server-form__row">
            <div className="server-form__field">
              <label htmlFor="connection_type" className="server-form__label">
                Connection Type *
              </label>
              <select
                id="connection_type"
                name="connection_type"
                value={formData.connection_type}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="server-form__input"
              >
                <option value="ssh">SSH</option>
                <option value="agent">Agent</option>
              </select>
            </div>

            <div className="server-form__field">
              <label htmlFor="environment" className="server-form__label">
                Environment
              </label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                disabled={isSubmitting}
                className="server-form__input"
              >
                <option value="">None</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>
        </div>

        <div className="server-form__section">
          <h2 className="server-form__section-title">SSH Credentials</h2>
          
          <div className="server-form__field">
            <label htmlFor="ssh_username" className="server-form__label">
              SSH Username
            </label>
            <input
              id="ssh_username"
              name="ssh_username"
              type="text"
              value={formData.ssh_username}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="root"
              className="server-form__input"
            />
          </div>

          <div className="server-form__field">
            <label htmlFor="ssh_password" className="server-form__label">
              SSH Password
            </label>
            <input
              id="ssh_password"
              name="ssh_password"
              type="password"
              value={formData.ssh_password}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="••••••••"
              className="server-form__input"
            />
          </div>

          <div className="server-form__field">
            <label htmlFor="ssh_private_key" className="server-form__label">
              SSH Private Key
            </label>
            <textarea
              id="ssh_private_key"
              name="ssh_private_key"
              value={formData.ssh_private_key}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="-----BEGIN RSA PRIVATE KEY-----"
              className="server-form__textarea"
              rows={4}
            />
          </div>
        </div>

        <div className="server-form__section">
          <h2 className="server-form__section-title">Tags</h2>
          
          <div className="server-form__tags-input">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              disabled={isSubmitting}
              placeholder="Add tag and press Enter"
              className="server-form__input"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={isSubmitting || !tagInput.trim()}
              className="server-form__add-tag-btn"
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="server-form__tags">
              {formData.tags.map((tag) => (
                <div key={tag} className="server-form__tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isSubmitting}
                    className="server-form__tag-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="server-form__actions">
          <button
            type="button"
            onClick={() => navigate('/servers')}
            disabled={isSubmitting}
            className="server-form__cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="server-form__submit-btn"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
