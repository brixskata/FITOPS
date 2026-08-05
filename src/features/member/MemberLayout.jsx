import { Outlet } from 'react-router-dom'
import MemberTopbar from './components/MemberTopbar'

export default function MemberLayout() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-ink">
      <MemberTopbar />
      <main className="pt-[84px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
