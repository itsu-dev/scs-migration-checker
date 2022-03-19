import React, {useState} from "react";
import "./CreateTimetable.css"
import {loadKdb, loadRuleDefinitions} from "../App";
import TimeTr, {TimeProps} from "./TimeTr";
import {SubjectProps} from "./SubjectTd";

type Module = {
    season: string,
    module: string,
    times: TimeProps[]
}

const CreateTimetable: React.FC = () => {
    const seasons = ["春", "秋"];
    const seasonModules = ["A", "B", "C"];
    const weeks = ["月", "火", "水", "木", "金"];
    const modules = new Map<string, Module>();

    const initialize = () => {
        seasonModules.forEach((seasonAlphabet) => {
            seasons.forEach((season) => {
                const times: TimeProps[] = [];

                for (let i = 1; i <= 6; i++) {
                    const subjects: SubjectProps[] = [];
                    weeks.forEach((week) => {
                        subjects.push({
                            subjectName: "",
                            subjectId: "",
                            isOnline: false,
                            season: season,
                            module: seasonAlphabet,
                            week: week,
                            time: i
                        })
                    })

                    times.push({
                        time: i,
                        subjects: subjects
                    })
                }

                modules.set(`${season}${seasonAlphabet}`, {
                    season: season,
                    module: seasonAlphabet,
                    times: times
                })
            })
        })
    }

    initialize();

    const [isLoading, setLoading] = useState(true);
    const [module, setModule] = useState<Module>(modules.get("春A")!!);

    window.onload = () => {
        setLoading(true);
        loadRuleDefinitions(() => {
            loadKdb(() => {
                setLoading(false);
            })
        });
    }

    const switchModule = (module: string) => {
        setModule(modules.get(module)!!);
    }

    return (
        <>
            <div className="menu menu-bar">
                <div className={`menu-item ${(module.season + module.module) === "春A" && "selected"}`} onClick={() => {switchModule("春A")}}>
                    春A
                </div>
                <div className={`menu-item ${(module.season + module.module) === "春B" && "selected"}`} onClick={() => {switchModule("春B")}}>
                    春B
                </div>
                <div className={`menu-item ${(module.season + module.module) === "春C" && "selected"}`} onClick={() => {switchModule("春C")}}>
                    春C
                </div>
                <div className={`menu-item ${(module.season + module.module) === "秋A" && "selected"}`} onClick={() => {switchModule("秋A")}}>
                    秋A
                </div>
                <div className={`menu-item ${(module.season + module.module) === "秋B" && "selected"}`} onClick={() => {switchModule("秋B")}}>
                    秋B
                </div>
                <div className={`menu-item ${(module.season + module.module) === "秋C" && "selected"}`} onClick={() => {switchModule("秋C")}}>
                    秋C
                </div>
            </div>
            <div className={"timetable-base"}>
                <div className={"timetable-box"}>
                    <table>
                        <tbody>
                            <tr>
                                <th className={"time"} />
                                <th>月</th>
                                <th>火</th>
                                <th>水</th>
                                <th>木</th>
                                <th>金</th>
                            </tr>
                            {module.times.map((time, index) =>
                                <TimeTr
                                    key={index}
                                    time={time.time}
                                    subjects={time.subjects} />
                            )}
                        </tbody>
                    </table>
                    {isLoading && <p id={"loading-text"}>読み込み中...</p>}
                </div>
                <div className={"contents-box"}>
                    test
                </div>
            </div>
        </>
    )
}

export default CreateTimetable;