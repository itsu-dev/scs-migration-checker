import {BrowserRouter, Route, Routes, useLocation} from "react-router-dom";
import MigrationChecker from "./main/MigrationChecker";
import MigrationRequirements from "./requirements/MigrationRequirements";
import CreateTimetable from "./create/CreateTimetable";
import React from "react";
import MenuBar, {MenuItem} from "./MenuBar";

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

export const getExcludedSeason = (ruleDefinitions: RuleDefinitions, subject: string): string | null => {
    let result: string | null = null;
    ruleDefinitions.exclusions.forEach((exclusion) => {
        exclusion.subjects.forEach((sbj) => {
            if (result === null && sbj === subject) {
                result = exclusion.season
            }
        })
    })
    return result
}

const App: React.FC = () => {
    const location = window.location.pathname;

    const index = () => {
        window.location.href=`${process.env.PUBLIC_URL}/`
    }

    const createTable = () => {
        window.location.href=`${process.env.PUBLIC_URL}/createTimetable`
    }

    const migrationRequirements = () => {
        window.location.href=`${process.env.PUBLIC_URL}/migrationRequirements`
    }

    const menuItems: MenuItem[] = [];

    menuItems.push({
        text: "?????????????????????????????????",
        selectedCondition: (text: string) => { return window.location.href.endsWith("/scs-migration-checker") || window.location.href.endsWith("/scs-migration-checker/"); },
        onClick: index
    });

    menuItems.push({
        text: "????????????????????????",
        selectedCondition: (text: string) => { return window.location.href.endsWith("/createTimetable"); },
        onClick: createTable
    });

    menuItems.push({
        text: "??????????????????",
        selectedCondition: (text: string) => { return window.location.href.endsWith("/migrationRequirements"); },
        onClick: migrationRequirements
    })

    return (
        <>
            <div className={'header-base'}>
                <div className="header">
                    <h2>???????????? ??????????????? ????????????????????????????????????2022????????????</h2>
                    <p className="caption">
                        ?????????4???2022????????? ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????<br/>
                        ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                    </p>
                </div>

                <div className={'table-box'}>
                    <MenuBar menuItems={menuItems} />

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
                            ???????????? ??????????????? ??????????????????????????????????????????????????????????????????????????????
                        </div>
                    </footer>
                </div>
            </div>
        </>
    )
}

export default App;