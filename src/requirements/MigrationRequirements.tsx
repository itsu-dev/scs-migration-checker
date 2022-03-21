import React, {useState} from "react";
import {
    getExcludedSeason,
    kdb,
    loadKdb,
    loadRuleDefinitions,
    ruleDefinitions
} from "../App";
import RequirementTr, {RequirementProps} from "./RequirementTr";
import {getSeasonByName} from "../KdBUtils";

const MigrationRequirements: React.FC = () => {
    const [isLoading, setLoading] = useState(true);
    const [requirements, setRequirements] = useState(new Array<RequirementProps>())

    window.onload = () => {
        setLoading(true);
        loadRuleDefinitions(() => {
            loadKdb(loadRequirements)
        });
    }

    const getRequirements = (): Promise<RequirementProps[]> => {
        return new Promise<RequirementProps[]>(resolve => {
            const result: RequirementProps[] = [];
            ruleDefinitions.departments.forEach((department) => {
                let rowSpan = 0;

                department.rules.forEach((rule) => {
                    if (rule.subjects && rule.isMain) rowSpan += rule.subjects.length
                })
                department.rules.forEach((rule, departmentIndex) => {
                    if (!rule.isMain || !rule.subjects) return

                    rule.subjects.forEach((subject, ruleIndex) => {
                        let isNormal = true;
                        let name = subject;
                        if (subject.startsWith("#")) {
                            name = subject.split(":")[1];
                            isNormal = false;
                        } else name = subject.split(":")[0]

                        let season = isNormal ? getExcludedSeason(ruleDefinitions, subject.split("::")[0]) : "";
                        if (isNormal && season === null) season = getSeasonByName(subject.split("::")[0]);
                        if (isNormal && season === null) season = "";

                        result.push(
                            {
                                department: departmentIndex === 0 && ruleIndex === 0 ? department.departmentName : null,
                                description: ruleIndex === 0 ? rule.description : null,
                                requirement: ruleIndex === 0 ? `${rule.minimum}単位以上` : null,
                                departmentRowSpan: departmentIndex === 0 && ruleIndex === 0 ? rowSpan : null,
                                descriptionRowSpan: ruleIndex === 0 ? rule.subjects.length : null,
                                name: name,
                                season: season!!,
                                unit: isNormal ? (subject.split("::").length > 1 ? subject.split("::")[1] : "1") : "-"
                            }
                        )
                    })
                })
            })
            resolve(result);
        })
    }

    const loadRequirements = async () => {
        setRequirements(await getRequirements());
        setLoading(false);
    }

    return (
        <>
            <table id={"migration-requirements"}>
                <tbody>
                    <tr>
                        <th className="migration-requirements-others-th">学群・学類</th>
                        <th className="migration-requirements-others-th">内容</th>
                        <th className="migration-requirements-others-th">要件</th>
                        <th className="migration-requirements-name-th">科目</th>
                        <th className="migration-requirements-season-th">開講時期</th>
                        <th className="migration-requirements-unit-th">単位数</th>
                    </tr>
                    {requirements.map((value, index) =>
                        <RequirementTr
                            key={index}
                            department={value.department}
                            description={value.description}
                            requirement={value.requirement}
                            departmentRowSpan={value.departmentRowSpan}
                            descriptionRowSpan={value.descriptionRowSpan}
                            name={value.name}
                            season={value.season}
                            unit={value.unit} />
                    )}
                </tbody>
            </table>

            {isLoading && <p id={"loading-text"}>読み込み中...</p>}
        </>
    )
}

export default MigrationRequirements;
