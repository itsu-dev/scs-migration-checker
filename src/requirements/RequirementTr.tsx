import React from "react";
import exp from "constants";

export type RequirementProps = {
    department: string | null,
    description: string | null,
    requirement: string | null,
    departmentRowSpan: number | null,
    descriptionRowSpan: number | null,
    name: string,
    season: string,
    unit: string
}

const RequirementTr: React.FC<RequirementProps> = (props: RequirementProps) => {
    let seasonClass = "";
    if (props.season.startsWith("春A")) seasonClass = "migration-requirements-sa";
    else if (props.season.startsWith("春B")) seasonClass = "migration-requirements-sb"
    else if (props.season.startsWith("春C")) seasonClass = "migration-requirements-sc"
    else if (props.season.startsWith("秋A")) seasonClass = "migration-requirements-fa"
    else if (props.season.startsWith("秋B")) seasonClass = "migration-requirements-fb"
    else if (props.season.startsWith("秋C")) seasonClass = "migration-requirements-fc"

    return (
        <tr>
            {props.department !== null &&
                <td rowSpan={props.departmentRowSpan!!}>{props.department}</td>
            }
            {props.description !== null &&
                <td rowSpan={props.descriptionRowSpan!!}>{props.description}</td>
            }
            {props.requirement !== null &&
            <td rowSpan={props.descriptionRowSpan!!}>{props.requirement}</td>
            }
            <td className={`migration-requirements migration-requirements-name ${seasonClass}`}>
                {props.name}
            </td>
            <td className={`migration-requirements ${seasonClass}`}>
                {props.season}
            </td>
            <td className={"migration-requirements"}>
                {props.unit}
            </td>
        </tr>
    )
}

export default RequirementTr;