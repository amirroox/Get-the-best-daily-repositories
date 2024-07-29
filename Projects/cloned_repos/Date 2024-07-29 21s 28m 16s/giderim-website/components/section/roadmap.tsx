"use client";

import { RoadmapAchievement } from "@/components/custom/roadmap-achievement";
import { cn } from "@/lib/utils";
import { type Variants, motion } from "framer-motion";

// TODO: progreess visualisation calculation needs a fix

const ROADMAP_ITEMS = [
	{
		date: "26 May, 2024",
		progress: 100,
		icon: "🥳",
		title: "Open beta launch",
		description: "The open beta for the project is now live!",
		achievements: [
			{ title: "gider.im website is live.", completed: true },
			{ title: "app.gider.im is live for beta testers.", completed: true },
		],
	},
	{
		date: "30 June, 2024",
		progress: 100,
		icon: "🔖",
		title: "Groups, Tags & Improvements",
		description:
			"Organize your entries with groups and tags. Improvements to the UI and UX.",
		achievements: [
			{ title: "Schema changes are ready.", completed: true },
			{
				title:
					"Completed UX improvements and adding more customization options.",
				completed: true,
			},
			{ title: "Groups and tags are ready for testing.", completed: true },
		],
	},
	{
		date: "30 July, 2024",
		progress: 10,
		icon: "🔄",
		title: "Sync & Backup",
		description: "Sync your data across devices and backup your data.",
		achievements: [
			{ title: "Add new setting for decimal symbol.", completed: true },
			{ title: "Localization improvements.", completed: false },
			{ title: "Install as application tutorial.", completed: false },
			{ title: "Sync between another device.", completed: false },
		],
	},
	{
		date: "30 August, 2024",
		progress: 0,
		icon: "✨",
		title: "Overview & Visual Stats",
		description: "Get an overview of your transactions and stats.",
		achievements: [
			{ title: "Overview page with stats and charts.", completed: false },
		],
	},
	{
		date: "30 September, 2024",
		progress: 0,
		icon: "💎",
		title: "Assets & Budgets",
		description:
			"Add assets, such as gold, stocks, foreign currencies, cryptocurrencies, and more.",
		achievements: [
			{ title: "Add assets.", completed: false },
			{ title: "Add budgets.", completed: false },
		],
	},
	{
		date: "30 October, 2024",
		progress: 0,
		icon: (
			<svg
				viewBox="0 0 256 250"
				width="256"
				height="250"
				fill="currentColor"
				className="size-6 top-1 relative"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMidYMid"
			>
				<path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
			</svg>
		),
		title: "Open Source",
		description: "The project will be open-sourced.",
		achievements: [
			{ title: "Write tests.", completed: false },
			{ title: "Refactor the codebase.", completed: false },
			{ title: "Write contributing guidelines.", completed: false },
			{ title: "Prepare workflows for CI/CD.", completed: false },
			{ title: "Publish to GitHub.", completed: false },
			{ title: "Accept contributions.", completed: false },
		],
	},
	{
		progress: 0,
		date: "30 November, 2024",
		icon: "📱",
		title: "iOS Widgets",
		description: "Separate app",
		achievements: [
			{ title: "Separate app for iOS widgets.", completed: false },
		],
	},
];

export default function Roadmap() {
	const item: Variants = {
		hidden: { opacity: 0, marginLeft: 20 },
		show: { opacity: 1, marginLeft: 0 },
	};
	return (
		<div className="mx-auto max-w-7xl sm:py-12 lg:flex lg:items-start lg:gap-x-10 px-4 sm:px-0 mt-8 sm:mt-0">
			<div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
				<div className="mx-auto sm:text-left">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Roadmap
					</h2>
				</div>
				<div className="mt-12">
					{ROADMAP_ITEMS.map((roadmap_item, index) => (
						<motion.div
							key={index}
							variants={item}
							initial="hidden"
							whileInView="show"
							className="flex gap-x-3"
						>
							<div
								className={cn(
									"relative last:after:hidden after:absolute after:top-10 after:bottom-8 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700",
									roadmap_item.progress === 100 &&
										"before:absolute before:top-10 before:bottom-8 before:start-3.5 before:w-[2px] before:-translate-x-px before:bg-green-500 dark:before:bg-green-700 before:z-10 before:rounded-lg",
									roadmap_item.progress < 100 &&
										roadmap_item.progress !== 0 &&
										"before:absolute before:top-10 before:bottom-24 before:start-3.5 before:w-[2px] before:-translate-x-px before:bg-green-500 dark:before:bg-green-700 before:z-10 before:rounded-lg",
								)}
							>
								<div className="relative z-10 size-7 flex justify-center items-center">
									<span className="size-6 flex-shrink-0 text-2xl">
										{roadmap_item.icon}
									</span>
								</div>
							</div>
							<div className="grow pt-0.5 pb-8">
								<div className="my-2 mt-2">
									<h3 className="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400">
										{roadmap_item.date}
									</h3>
								</div>
								<h3 className="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white">
									{roadmap_item.title}
								</h3>
								<p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
									{roadmap_item.description}
								</p>
								{roadmap_item.achievements.map((achievement, index) => (
									<RoadmapAchievement key={index} {...achievement} />
								))}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
}
