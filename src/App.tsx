import {BrowserRouter, Route, Routes, useLocation} from "react-router-dom";
import MigrationChecker from "./main/MigrationChecker";
import MigrationRequirements from "./requirements/MigrationRequirements";
import CreateTimetable from "./create/CreateTimetable";
import React from "react";

export type UserSubject = {
    id: string,
    name: string,
    unit: number
}

export type Rule = {
    description: string,
    type: string,
    subjects: Array<string>,
    isMain: boolean,
    minimum: number,
    maximum: number,
    message: string
}

export type Department = {
    departmentName: string,
    rules: Array<Rule>
}

export type Exclusion = {
    subjects: Array<string>,
    season: string
}

export type RuleDefinitions = {
    version: string,
    updatedAt: string,
    author: string,
    exclusions: Array<Exclusion>,
    departments: Array<Department>
}

export type KdB = {
    data: Map<string, Array<string>>
}

const URL_RULE_DEFINITIONS = 'https://boke.itsu.dev/scs-migration-checker/rule_definitions.json';
const URL_KDB = 'https://raw.githubusercontent.com/Mimori256/kdb-parse/main/kdb.json';

export let isRuleLoaded = false;
export let isKdbLoaded = false;
export let ruleDefinitions: RuleDefinitions;
export let kdb: KdB;

window.onload = () => {
    loadRuleDefinitions()
    loadKdb()
}

export const loadRuleDefinitions = (onLoad: () => void = () => {}) => {
    if (!isRuleLoaded) {
        console.log("[Rule Definitions] Loading...")
        window.fetch(new Request(URL_RULE_DEFINITIONS))
            .then((response) => {
                response.text().then((json) => {
                    onLoadRuleDefinitionsFinished(json);
                    onLoad();
                })
            })
    }
}

export const loadKdb = (onLoad: () => void = () => {}) => {
    if (!isKdbLoaded) {
        console.log("[KdB] Loading...")
        window.fetch(new Request(URL_KDB))
            .then((response) => {
                response.text().then((json) => {
                    onLoadKdbFinished(json);
                    onLoad();
                })
            })
    }
}

const onLoadKdbFinished = (json: string) => {
    kdb = {
        data: new Map<string, Array<string>>(Object.entries(JSON.parse(json)))
    }
    isKdbLoaded = true;
    console.log('[KdB] Loaded')
}

const onLoadRuleDefinitionsFinished = (json: string) => {
    ruleDefinitions = JSON.parse(json) as RuleDefinitions
    isRuleLoaded = true
    console.log(`[Rule Definitions] Loaded - Version: ${ruleDefinitions.version} Last Updated At: ${ruleDefinitions.updatedAt}`)
}

export const getSeasonByName = (kdb: KdB, name: string): string | null => {
    const filtered = Array.from(kdb.data.values()).filter((value) => value[0] === name)
    return filtered ? `${filtered[0][1]} ${filtered[0][2]}` : null
}

export const getExcludedSeason = (ruleDefinitions: RuleDefinitions, subject: string): string | null => {
    ruleDefinitions.exclusions.forEach((exclusion) => {
        exclusion.subjects.forEach((sbj) => {
            if (sbj === subject) return exclusion.season
        })
    })
    return null
}

const App: React.FC = () => {
    const location = window.location.pathname;

    const index = () => {
        window.location.href="/"
    }

    const createTable = () => {
        window.location.href="/createTimetable"
    }

    const migrationRequirements = () => {
        window.location.href="/migrationRequirements"
    }

    return (
        <>
            <div className={'header-base'}>
                <div className="header">
                    <h2>筑波大学 総合学域群 移行要件チェックツール（2021年度用）</h2>
                    <p className="caption">
                        「令和3（2021）年度 履修・移行ガイドブック」に沿って、自分の履修時間割が移行要件に適合しているかを確認します。<br/>
                        このツールは総合学域群生の履修組みの利便性向上を目指して、有志によって開発されています。筑波大学公式ではありません。
                    </p>
                </div>

                <div className={'table-box'}>
                    <div className="menu menu-bar">
                        <div className={`menu-item ${location === "/" && "selected"}`} onClick={index}>
                            移行要件チェックツール
                        </div>
                        {/*
                        <div className={`menu-item ${location === "/createTimetable" && "selected"}`} onClick={createTable}>
                            履修仮組みツール
                        </div>
                        */}
                        <div className={`menu-item ${location === "/migrationRequirements" && "selected"}`} onClick={migrationRequirements}>
                            移行要件一覧
                        </div>
                    </div>

                    <BrowserRouter basename={process.env.PUBLIC_URL}>
                        <Routes>
                            <Route index element={<MigrationChecker/>}/>
                            <Route path="/createTimetable" element={<CreateTimetable/>}/>
                            <Route path="/migrationRequirements" element={<MigrationRequirements/>}/>
                        </Routes>
                    </BrowserRouter>


                    <footer>
                        <div className="footer" id="footer">
                            <br/>
                            Contributed by <a href="https://github.com/itsu-dev">Itsu</a>, <a
                            href="https://github.com/Mimori256">Mimori256</a> / <a
                            href="https://github.com/itsu-dev/scs-migration-checker">GitHub</a> <br/>
                            筑波大学 総合学域群 移行要件チェックツールは筑波大学公式ではありません。
                        </div>
                    </footer>
                </div>
            </div>
        </>
    )
}

export default App;