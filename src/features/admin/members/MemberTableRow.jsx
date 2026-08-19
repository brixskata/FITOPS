import { useState } from 'react'
import { Edit3, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { classNames } from '../../../utils/helpers'

const statusStyles = {
  active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  inactive: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
  suspended: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
}

export default function MemberTableRow({ member, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleAction = (action) => {
    setMenuOpen(false)
    onAction(action, member)
  }

  return (
    <tr className="border-t border-ink/5 text-sm text-ink/80 hover:bg-ink/[0.02]">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-accent">
            {member.avatar_initials}
          </div>
          <div className="hidden text-xs text-ink/45 sm:block">{member.membership?.plan_name ?? 'No Membership'}</div>
        </div>
      </td>
      <td className="px-4 py-4 font-semibold text-ink">{member.member_code}</td>
      <td className="px-4 py-4 font-medium text-ink">{member.name}</td>
      <td className="px-4 py-4">{member.email}</td>
      <td className="px-4 py-4 whitespace-nowrap">{member.phone}</td>
      <td className="px-4 py-4">
        {member.trainer ? (
          <div>
            <p className="font-medium text-ink">{member.trainer.name}</p>
            {member.trainer.employee_code && <p className="mt-1 text-xs text-ink/45">{member.trainer.employee_code}</p>}
          </div>
        ) : (
          <span className="text-sm text-ink/45">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-4">
        <span className={classNames('inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]', statusStyles[member.status], !statusStyles[member.status] && 'border-ink/10 bg-ink/5 text-ink/60')}>
          {member.status_label ?? member.status}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-ink/60">{member.joined_date}</td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => handleAction('view')} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-accent hover:text-ink">
            <Eye size={14} />
            View
          </button>
          <button type="button" onClick={() => handleAction('edit')} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-accent hover:text-ink">
            <Edit3 size={14} />
            Edit
          </button>
          <button type="button" onClick={() => handleAction('delete')} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-accent hover:text-ink">
            <Trash2 size={14} />
            Delete
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-label={`Open actions for ${member.name}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-accent hover:text-ink"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-10 w-44 rounded-2xl border border-ink/10 bg-white p-2 shadow-xl">
                <button type="button" onClick={() => handleAction('view')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink/75 transition hover:bg-ink/5 hover:text-ink">
                  <Eye size={15} />
                  View member
                </button>
                <button type="button" onClick={() => handleAction('edit')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink/75 transition hover:bg-ink/5 hover:text-ink">
                  <Edit3 size={15} />
                  Edit member
                </button>
                <button type="button" onClick={() => handleAction('delete')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink/75 transition hover:bg-ink/5 hover:text-ink">
                  <Trash2 size={15} />
                  Delete member
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}
