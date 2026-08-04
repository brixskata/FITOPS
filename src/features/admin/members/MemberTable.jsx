import MemberTableRow from './MemberTableRow'

const columns = ['Avatar', 'Member Code', 'Full Name', 'Email', 'Phone', 'Membership Status', 'Joined Date', 'Actions']

export default function MemberTable({ members, onAction }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_18px_60px_rgba(18,18,18,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-separate border-spacing-0">
          <thead className="bg-[#fbfbf9]">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <MemberTableRow key={member.id} member={member} onAction={onAction} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
