import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { ALL_SECTIONS, getDefaultPermissions } from '../helpers/permissions'

export const PermissionSelector = ({ value = [], onChange, role }) => {
  const permissions = value.length > 0 ? value : getDefaultPermissions(role)
  const [expanded, setExpanded] = useState([])

  const toggleSection = (sectionId) => {
    setExpanded((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    )
  }

  const hasSection = (sectionId) => permissions.includes(sectionId)

  const toggleSectionPerm = (sectionId) => {
    const section = ALL_SECTIONS.find((s) => s.id === sectionId)
    const subIds = (section?.subs || []).map((sub) => `${sectionId}.${sub.id}`)
    if (hasSection(sectionId)) {
      onChange(permissions.filter((p) => p !== sectionId && !subIds.includes(p)))
    } else {
      const newPerms = [...permissions, sectionId]
      onChange(newPerms)
    }
  }

  const hasSub = (sectionId, subId) => permissions.includes(`${sectionId}.${subId}`)

  const toggleSub = (sectionId, subId) => {
    const key = `${sectionId}.${subId}`
    if (hasSub(sectionId, subId)) {
      onChange(permissions.filter((p) => p !== key))
    } else {
      const newPerms = [...permissions, key]
      if (!hasSection(sectionId)) newPerms.push(sectionId)
      onChange(newPerms)
    }
  }

  return (
    <section className='space-y-1'>
      {ALL_SECTIONS.map((section) => {
        const hasSubs = section.subs && section.subs.length > 0
        const isExpanded = expanded.includes(section.id)
        const isChecked = hasSection(section.id)

        return (
          <section key={section.id}>
            <section className='flex items-center gap-2 py-2'>
              {hasSubs && (
                <button
                  type='button'
                  onClick={() => toggleSection(section.id)}
                  className='p-0.5 rounded hover:bg-accent/10 transition cursor-pointer text-muted'>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                </button>
              )}
              {!hasSubs && <section className='w-5' />}
              <button
                type='button'
                onClick={() => toggleSectionPerm(section.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition cursor-pointer shrink-0 ${
                  isChecked
                    ? 'bg-accent border-accent text-surface'
                    : 'border-muted hover:border-accent'
                }`}>
                {isChecked && <Check className='w-3.5 h-3.5' />}
              </button>
              <span
                className={`text-sm font-medium ${isChecked ? 'text-on-surface' : 'text-muted'}`}>
                {section.label}
              </span>
            </section>

            {hasSubs && isExpanded && (
              <section className='ml-8 space-y-1 pb-1'>
                {section.subs.map((sub) => {
                  const subChecked = hasSub(section.id, sub.id)
                  return (
                    <section key={sub.id} className='flex items-center gap-2 py-1.5'>
                      <button
                        type='button'
                        onClick={() => toggleSub(section.id, sub.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition cursor-pointer shrink-0 ${
                          subChecked
                            ? 'bg-accent border-accent text-surface'
                            : 'border-muted hover:border-accent'
                        }`}>
                        {subChecked && <Check className='w-3 h-3' />}
                      </button>
                      <span
                        className={`text-sm ${subChecked ? 'text-on-surface' : 'text-muted'}`}>
                        {sub.label}
                      </span>
                    </section>
                  )
                })}
              </section>
            )}
          </section>
        )
      })}
    </section>
  )
}
