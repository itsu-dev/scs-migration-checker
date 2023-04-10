import {KdBData, KdBItem, SubjectId} from "../consts/KdbConstants";
import {DayOfWeek, Module, Period} from "../consts/TimetableConstants";

export const getKdBItemById = (kdbData: KdBData, subjectId: SubjectId): KdBItem | null => {
    const result = kdbData[subjectId];
    return result ? result : null;
}

export const filterKdBBySpecificPeriod = (kdbData: KdBData, module: Module, dayOfWeek: DayOfWeek, period: Period): KdBData => {
    return Object.fromEntries(Object.entries(kdbData)
        .filter(entry => {
            const modules = analyzeKdBModule(entry[1][1]);
            const periods = analyzeKdBPeriod(entry[1][2]);
            return modules.includes(module) && periods.includes(dayOfWeek + period);
        })) as KdBData;
}

export const filterKdBByIdOrName = (kdbData: KdBData, keyword: string): KdBData => {
    return Object.fromEntries(Object.entries(kdbData)
        .filter(entry => {
            return (keyword.length > 0 && entry[0].includes(keyword) || entry[1][0].includes(keyword)) || keyword.length == 0;
        })) as KdBData;
}

export const analyzeKdBModule = (kdbModuleText: string): string[] => {
    let modules = kdbModuleText.trim();

    if (modules.match(/^([春秋][ABC]+)+$/) == null) {
        return [kdbModuleText];
    }

    const disassembledModules = [];
    while (true) {
        const matched = modules.match(/^([春秋][ABC]+)+$/);
        if (matched) {
            disassembledModules.push(matched[1]);
            if (matched[0].replace(matched[1], "").length > 0) {
                modules = matched[0].replace(matched[1], "");
            } else {
                break;
            }
        } else {
            break;
        }
    }

    const result: string[] = [];
    disassembledModules.forEach(assembled => {
        const season = assembled[0];
        for (let i = 1; i < assembled.length; i++) {
            result.push(season + assembled[i]);
        }
    });

    return result;
}

export const analyzeKdBPeriod = (kdbPeriodText: string): string[] => {
    if (kdbPeriodText.match(/[月火水木金]\d/) == null) {
        return [kdbPeriodText];
    }

    const split = kdbPeriodText.split(" ");
    const result: string[] = [];
    split.forEach(s => {
        if (s.match(/[月火水木金]\d/) == null) {
            result.push(s);
        } else {
            const dayOfWeek = s[0];
            const periods = s.substring(1).split(",");
            periods.forEach(p => result.push(dayOfWeek + p));
        }
    });

    return result;
}