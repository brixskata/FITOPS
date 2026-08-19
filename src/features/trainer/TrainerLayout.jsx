import { Outlet } from 'react-router-dom'
import TrainerHeader from './components/TrainerHeader'

export default function TrainerLayout() {
  return <div className="min-h-screen bg-[#f7f7f5] text-ink"><TrainerHeader /><main className="pt-[84px]"><div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10"><Outlet /></div></main></div>
}
