import {KdB, kdb} from "./App";
import exp from "constants";

const seasons = ["春", "秋"];
const seasonModules = ["A", "B", "C"];
const weeks = ["月", "火", "水", "木", "金"];

export type KdBItem = {
    id: string,
    name: string,
    modules: Array<string>,
    periods: Array<string>,
    modulesText: string,
    periodsText: string,
    description: string,
    unit: number
}

export const searchKdBWithModule = (module: string, time: string): Array<KdBItem> => {
    const result: Array<KdBItem> = [];
    Array.from(kdb.data.entries())
        .filter(kdbData => {
            return parseModule(kdbData[1][1]).includes(module) && parsePeriod(kdbData[1][2])[0].includes(time);
        })
        .forEach(kdbData => {
            /*
            if (result.filter(data => data[0] === kdbData[0]).length == 0) {
                result.push(kdbData);
            }
            */
            result.push(kdbItemFromArray(kdbData[0], kdbData[1]));
        })
    return result;
}

// "春ABC"のような形式から["春A", "春B", "春C"]に変換する
export const parseModule = (modulesString: string): Array<string> => {
    // 開講時期をパース
    let season = "";
    const seasonsArray: string[] = [];  // 結果

    // 1文字ずつ調べる
    for (let i = 0; i < modulesString.length; i++) {
        const char = modulesString.charAt(i);  // i文字目
        // 春または秋だったら
        if (seasons.includes(char)) {
            season = char;  // 保存しておく

            // A, B, Cのいずれかだったら
        } else if (seasonModules.includes(char)) {
            seasonsArray.push(season + char);  // 結果として保存（ex.春A）
        }
    }

    return seasonsArray;
}

// 金1,2や水1,木5のような形式から["金1", "金2"], ["水1", "木5"]に変換
// パースできない形式（応談等など）の場合、返り値の[1]がtrueになる
export const parsePeriod = (periodsString: string): [Array<string>, boolean] => {
    let week = "";
    let needConsul = false;
    const timesArray: string[] = [];  // 結果

    // 生データ,で区切られているので,で区切る
    periodsString.split(",").forEach((split) => {
        // 通常の形式だったら
        if (split.match("[1-9]*") !== null) {
            // 1文字ずつ調べる
            for (let i = 0; i < split.length; i++) {
                const char = split.charAt(i);  // i文字目
                // 月～金のいずれかだったら
                if (weeks.includes(char)) {
                    week = char;  // 保存しておく

                    // そうでなければ数字と判断する
                } else {
                    timesArray.push(week + char)  // 結果として保存（ex.月6）
                }
            }
        } else {
            needConsul = true;
        }
    });
    return [timesArray, needConsul]
}

export const getSeasonByName = (name: string): string | null => {
    const filtered = Array.from(kdb.data.values()).filter((value) => value[0] === name)
    return filtered ? `${filtered[0][1]} ${filtered[0][2]}` : null
}

export const isOnline = (kdb: KdBItem): boolean => {
    return kdb.description.includes("オンライン") || kdb.description.includes("オンデマンド");
}

export const needSubscribe = (kdb: KdBItem): boolean => {
    return kdb.description.includes("事前登録対象");
}

export const kdbItemFromArray = (id: string, data: Array<string>): KdBItem => {
    return {
        id: id,
        name: data[0],
        modules: parseModule(data[1]),
        periods: parsePeriod(data[2])[0],
        modulesText: data[1],
        periodsText: data[2],
        description: data[4],
        unit: +data[5]
    }
}