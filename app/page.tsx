import Link from 'next/link';
import type { CSSProperties } from 'react';
import ThemePicker from './components/ThemePicker';
import { games, navGames } from './data/games';

export default function Home() {
	return (
		<div className='flex h-screen'>
			<aside className='w-64 h-full glass border-r border-white/5 flex flex-col z-20 transition-transform'>
				<div className='border-b border-white/5'>
					<Link href='/' className='flex items-center gap-3 group'>
						<div className='w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform'>
							🎮
						</div>
						<h1 className='text-xl font-bold text-gradient flex-1'>Game Hub</h1>
					</Link>

					<div className='flex items-center justify-between bg-white/5 rounded-xl border border-white/5'>
						<span className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
							Theme
						</span>
						<div className='scale-90 origin-right'>
							<ThemePicker />
						</div>
					</div>
				</div>

				<nav className='flex-1 overflow-y-auto space-y-1'>
					<div className='text-xs font-semibold text-muted uppercase tracking-wider'>
						Games
					</div>
					{navGames.map(game => (
						<a
							key={game.name}
							href={game.path}
							className='flex items-center gap-3 rounded-xl text-muted hover:text-main hover:bg-white/5 transition-all group'
						>
							<span className='text-xl group-hover:scale-110 transition-transform'>
								{game.icon}
							</span>
							<span className='font-medium'>{game.name}</span>
						</a>
					))}
				</nav>

				<div className='border-t border-white/5'>
					<div className='glass rounded-xl text-xs text-center text-muted'>
						v2.0.0 • PRO Edition
					</div>
				</div>
			</aside>

			<main className='flex-1 overflow-y-auto relative scroll-smooth'>
				<div className='relative min-h-screen'>
					<div className='fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none'>
						<div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse' />
						<div
							className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse'
							style={{ animationDelay: '2s' }}
						/>
					</div>

					<div className='max-w-5xl mx-auto'>
						<div className='text-center'>
							<h1 className='text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 mb-4'>
								🎮 Game Hub
							</h1>
							<p className='text-slate-400 text-xl'>Pick your challenge!</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
							{games.map(game => (
								<a
									key={game.name}
									href={game.path}
									className='game-card group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:border-white/30 overflow-hidden'
									style={{ '--glow-color': game.bgGlow } as CSSProperties}
								>
									<div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,var(--glow-color),transparent_70%)]' />

									<div className='absolute -top-2 -right-2 text-6xl game-icon transition-all duration-500 ease-out rotate-15 group-hover:rotate-0 group-hover:scale-110 origin-center'>
										{game.icon}
									</div>

									<div className='relative z-10'>
										<h2
											className={`text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r ${game.color} mb-3`}
										>
											{game.name}
										</h2>
										<p className='text-slate-400 text-lg'>{game.desc}</p>
									</div>

									<div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2'>
										<span className='text-3xl'>→</span>
									</div>
								</a>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
