import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '@/shared/components/ui/Button.jsx'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card.jsx'
import { ROUTES } from '@/app/paths.js'

const MotionSection = motion.section

const highlights = [
	{
		title: 'Community-first',
		description: 'KickOff Hub blends verified football data with an active forum so analysts and supporters can learn together.',
	},
	{
		title: 'Modular architecture',
		description: 'Each feature ships with its own API helpers, hooks, and UI, making it effortless to extend the product.',
	},
	{
		title: 'Real-time insights',
		description: 'Background jobs sync players, leagues, and posts so your dashboard always reflects the latest matches.',
	},
]

const roadmap = [
	{ phase: 'Phase 1', summary: 'Layout foundation, navigation, hero metrics for home.' },
	{ phase: 'Phase 2', summary: 'Integrate API modules for countries, leagues, teams, and players.' },
	{ phase: 'Phase 3', summary: 'Deep dives with charts, comparisons, and richer storytelling.' },
	{ phase: 'Phase 4', summary: 'Personalized analytics, smart alerts, and collaborative research tools.' },
]

const stack = ['React 19 + Vite 7', 'Tailwind CSS + Framer Motion', 'Axios API client with token refresh', 'Zustand app-wide stores', 'Shared UI primitives']

export default function AboutPage() {
	const navigate = useNavigate()

	return (
		<MotionSection
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="space-y-8"
		>
			<header className="space-y-3">
				<p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary-500">Project vision</p>
				<h1 className="text-4xl font-black tracking-tight text-slate-900">About KickOff Hub</h1>
				<p className="max-w-2xl text-base text-slate-600">
					KickOff Hub is a modern football intelligence workspace inspired by the depth of fbref.com, designed for storytellers who need reliable data and expressive UI.
				</p>
			</header>

			<div className="grid gap-4 md:grid-cols-3">
				{highlights.map((item) => (
					<Card key={item.title} className="border-slate-200 bg-white/80">
						<CardHeader>
							<CardTitle>{item.title}</CardTitle>
							<CardDescription>{item.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="border-slate-200 bg-white/80">
					<CardHeader>
						<CardTitle>Roadmap</CardTitle>
						<CardDescription>How we plan to evolve the experience.</CardDescription>
					</CardHeader>
					<CardContent>
						<ol className="space-y-3 text-sm text-slate-600">
							{roadmap.map((item) => (
								<li key={item.phase} className="rounded-xl border border-slate-100 bg-white/70 p-4">
									<p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">{item.phase}</p>
									<p className="mt-1 font-medium text-slate-900">{item.summary}</p>
								</li>
							))}
						</ol>
					</CardContent>
				</Card>
				<Card className="border-slate-200 bg-white/80">
					<CardHeader>
						<CardTitle>Tech stack</CardTitle>
						<CardDescription>Composable tools for fast iterations.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
							{stack.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
						<div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
							<p className="font-semibold text-slate-900">What’s next?</p>
							<p className="mt-1">
								We are opening the forum to curated moderators and adding richer moderation tools so discussions stay insightful.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Button type="button" onClick={() => navigate(ROUTES.forum)}>
								Visit the forum
							</Button>
							<Button type="button" variant="outline" onClick={() => navigate(ROUTES.players)}>
								Browse players
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MotionSection>
	)
}
