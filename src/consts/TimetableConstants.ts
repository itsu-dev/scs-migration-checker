export const ModulesArray = ['春A', '春B', '春C', '秋A', '秋B', '秋C'] as const;
export type Module = typeof ModulesArray[number];

export const SeasonsArray = ['春', '秋'] as const;
export type Season = typeof SeasonsArray[number];

export const DayOfWeeksArray = ['月', '火', '水', '木', '金'] as const;
export type DayOfWeek = typeof DayOfWeeksArray[number];

export const PeriodsArray = [1, 2, 3, 4, 5, 6] as const;
export type Period = typeof PeriodsArray[number];
