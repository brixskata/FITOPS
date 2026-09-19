import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useAuth from '../../../hooks/useAuth'
import { getAdminSettingsErrorMessage, getAdminProfile, saveAdminProfile } from '../../../services/adminSettingsService'
import ProfileSection from './ProfileSection'
import SecuritySection from './SecuritySection'
import SystemInformationSection from './SystemInformationSection'

const profileFromUser = (user) => ({ name: user?.name ?? '', email: user?.email ?? '' })

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(() => profileFromUser(user))
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setPageError('')

    getAdminProfile()
      .then((currentUser) => {
        if (!active || !currentUser) return
        setProfile(profileFromUser(currentUser))
        updateUser(currentUser)
      })
      .catch((error) => {
        if (active) setPageError(getAdminSettingsErrorMessage(error, 'Unable to load your profile.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [updateUser])

  const onChange = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: null, form: null }))
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const updatedUser = await saveAdminProfile(profile)
      const updatedProfile = profileFromUser(updatedUser)
      setProfile(updatedProfile)
      updateUser(updatedUser)
      toast.success('Profile updated successfully.')
    } catch (error) {
      const validationErrors = error.errors ?? {}
      if (error.status === 422 && Object.keys(validationErrors).length) {
        setErrors(validationErrors)
        toast('Please fix the highlighted fields.', { icon: '!' })
      } else {
        setErrors({ form: getAdminSettingsErrorMessage(error, 'Unable to update your profile.') })
        toast.error(getAdminSettingsErrorMessage(error, 'Unable to update your profile.'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {pageError && <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">{pageError}</div>}

      {loading ? <SettingsSkeleton /> : <div className="space-y-6"><ProfileSection form={profile} errors={errors} saving={saving} onChange={onChange} onSubmit={submitProfile} /><SecuritySection /><SystemInformationSection /></div>}
    </div>
  )
}

function SettingsSkeleton() {
  return <div className="space-y-6" aria-label="Loading settings"><div className="h-64 animate-pulse rounded-3xl border border-ink/10 bg-white" /><div className="h-72 animate-pulse rounded-3xl border border-ink/10 bg-white" /><div className="h-48 animate-pulse rounded-3xl border border-ink/10 bg-white" /></div>
}
