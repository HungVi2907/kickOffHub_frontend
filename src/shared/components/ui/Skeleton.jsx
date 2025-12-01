import { cn } from '@/shared/utils/cn.js'

export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-100', className)} />
}
