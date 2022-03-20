import {KdB, kdb} from "./App";

const seasons = ["春", "秋"];
const seasonModules = ["A", "B", "C"];
const weeks = ["月", "火", "水", "木", "金"];

export const searchKdBWithModule = (module: string, time: string): Array<Array<string>> => {
    const result: Array<Array<string>> = [];
    Array.from(kdb.data.values())
        .filter(kdbData => {
            return getSeasonsArray(kdbData).includes(module) && getTimesArray(kdbData)[0].includes(time);
        })
        .forEach(kdbData => {
            /*
            if (result.filter(data => data[0] === kdbData[0]).length == 0) {
                result.push(kdbData);
            }
            */
            result.push(kdbData);
        })
    return result;
}

export const getSeasonsArray = (kdbData: Array<string>): Array<string> => {
    // 開講時期をパース
    let season = "";
    const seasonsArray: string[] = [];  // 結果

    // 1文字ずつ調べる
    for (let i = 0; i < kdbData[1].length; i++) {
        const char = kdbData[1].charAt(i);  // i文字目
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

export const getTimesArray = (kdbData: Array<string>): [Array<string>, boolean] => {
    let week = "";
    let needConsul = false;
    const timesArray: string[] = [];  // 結果

    // 生データ,で区切られているので,で区切る
    kdbData[2].split(",").forEach((split) => {
        // 応談じゃなかったら
        if (split !== "応談") {
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

            // 応談だったらその旨をメッセージに記載
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

export const isOnline = (kdbData: Array<string>): boolean => {
    return kdbData[4].includes("オンライン") || kdbData[4].includes("オンデマンド");
}

export const needSubscribe = (kdbData: Array<string>): boolean => {
    return kdbData[4].includes("事前登録対象");
}